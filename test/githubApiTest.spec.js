const chai = require('chai');
const axios = require('axios');

const uri = 'https://api.github.com';
const header = {
    'Accept': 'application/vnd.github.v3+json',
    'Authorization': 'token *****'
};

describe('github APIs', function () {
    describe('GET /users/{username}/repos', function() {
        it('should return a 200 with valid username', async function() {
            const response = await axios.get(uri + `/users/GitKelley/repos`, 
            {
                    headers: header,
                    validateStatus: status => status === 200
            })
            chai.expect(response.data).to.not.be.empty;
        })

        // I'm the owner of my repos, so using the member type should return no repos
        it('should return a 200 and display only repos user is a member of', async function() {
            const response = await axios.get(uri + `/users/GitKelley/repos?type=member`, 
            {
                    headers: header,
                    validateStatus: status => status === 200
            })
            chai.expect(response.data).to.be.empty;
        })

        // StaffUngradedAssignment is the last repo in my list
        it('should return a 200 and display repos in descending order', async function() {
            const response = await axios.get(uri + `/users/GitKelley/repos?direction=desc`, 
            {
                    headers: header,
                    validateStatus: status => status === 200
            })
            chai.expect(response.data[0].name).to.equal('StaffUngradedAssignment');
        })

        it('should return a 200 and only display two repos', async function() {
            const response = await axios.get(uri + `/users/GitKelley/repos?per_page=2`, 
            {
                    headers: header,
                    validateStatus: status => status === 200
            })
            chai.expect(response.data).to.have.lengthOf.at.most(2);
        })

        // Fastlane should be the repo returned with one per page selecting the second page
        it('should return a 200 and only display repos from second page while limiting results to one repo per page', async function() {
            const response = await axios.get(uri + `/users/GitKelley/repos?per_page=1&page=2`, 
            {
                    headers: header,
                    validateStatus: status => status === 200
            })
            chai.expect(response.data[0].name).to.equal('fastlane');
            chai.expect(response.data).to.have.lengthOf.at.most(1);
        })

        it('should return a 404 with a username that isnt found', async function() {
            await axios.get(uri + `/users/GitKelley123/repos`, 
            {
                headers: header,
                validateStatus: status => status === 404
            })
        })
    })

    describe('PUT /repos/{owner}/{repo}/contents/{path}', function () {
        let data = {
            body: 'This is a new comment'
        }
        it('should return a 200 and create a commit comment', async function () {
            const response = await axios.post(uri + `/repos/GitKelley/EdXJenkinsLab/commits/8147d505b846b9049b489a3cd7a3d2e22f608ee0/comments`, 
            data,
            {
                headers: header,
                validateStatus: status => status === 201
            })
            chai.expect(response.data.commit_id).to.equal('8147d505b846b9049b489a3cd7a3d2e22f608ee0');
            chai.expect(response.data.body).to.equal(data.body)
        })

        it('should return a 404 with an invalid owner', async function () {
            await axios.post(uri + `/repos/GitKelley123/EdXJenkinsLab/commits/8147d505b846b9049b489a3cd7a3d2e22f608ee0/comments`, 
            data,
            {
                headers: header,
                validateStatus: status => status === 404
            })
        })

        it('should return a 404 with an invalid repo', async function () {
            await axios.post(uri + `/repos/GitKelley/fakeRepo/commits/8147d505b846b9049b489a3cd7a3d2e22f608ee0/comments`, 
            data,
            {
                headers: header,
                validateStatus: status => status === 404
            })
        })

        it('should return a 422 with an invalid commit hash', async function () {
            await axios.post(uri + `/repos/GitKelley/EdXJenkinsLab/commits/123/comments`, 
            data,
            {
                headers: header,
                validateStatus: status => status === 422
            })
        })

        it('should return a 400 with a malformed body', async function () {
            data = 'malformed'
            await axios.post(uri + `/repos/GitKelley/EdXJenkinsLab/commits/8147d505b846b9049b489a3cd7a3d2e22f608ee0/comments`, 
            data,
            {
                headers: header,
                validateStatus: status => status === 400
            })
        })
    })
})
