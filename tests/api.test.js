const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server'); // Adjust the path to your server file
const should = chai.should();

chai.use(chaiHttp);

describe('API Endpoints', () => {
  let authToken;
  
  // Test GET /status
  it('should return status of the services', (done) => {
    chai.request(server)
      .get('/status')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('redis');
        res.body.should.have.property('db');
        done();
      });
  });

  // Test GET /stats
  it('should return the stats of the services', (done) => {
    chai.request(server)
      .get('/stats')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('users');
        res.body.should.have.property('files');
        done();
      });
  });

  // Test POST /users
  it('should create a new user', (done) => {
    chai.request(server)
      .post('/users')
      .send({ email: 'testuser@example.com', password: 'password' })
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a('object');
        res.body.should.have.property('email');
        res.body.should.have.property('id');
        done();
      });
  });

  // Test GET /connect
  it('should login a user and return a token', (done) => {
    const credentials = Buffer.from('testuser@example.com:password').toString('base64');
    chai.request(server)
      .get('/connect')
      .set('Authorization', `Basic ${credentials}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('token');
        authToken = res.body.token;
        done();
      });
  });

  // Test GET /disconnect
  it('should logout a user', (done) => {
    chai.request(server)
      .get('/disconnect')
      .set('X-Token', authToken)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });

  // Test GET /users/me
  it('should return the authenticated user details', (done) => {
    chai.request(server)
      .get('/users/me')
      .set('X-Token', authToken)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('email');
        res.body.should.have.property('id');
        done();
      });
  });

  // Test POST /files
  it('should create a new file', (done) => {
    chai.request(server)
      .post('/files')
      .set('X-Token', authToken)
      .send({ name: 'testfile.txt', type: 'file', data: 'Hello World' })
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a('object');
        res.body.should.have.property('id');
        res.body.should.have.property('name');
        done();
      });
  });

  // Test GET /files/:id
  it('should return file details by id', (done) => {
    const fileId = 'file_id_to_test'; // replace with actual file id
    chai.request(server)
      .get(`/files/${fileId}`)
      .set('X-Token', authToken)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('id');
        res.body.should.have.property('name');
        done();
      });
  });

  // Test GET /files with pagination
  it('should return list of files with pagination', (done) => {
    chai.request(server)
      .get('/files')
      .set('X-Token', authToken)
      .query({ page: 1, limit: 10 })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        done();
      });
  });

  // Test PUT /files/:id/publish
  it('should publish a file by id', (done) => {
    const fileId = 'file_id_to_publish'; // replace with actual file id
    chai.request(server)
      .put(`/files/${fileId}/publish`)
      .set('X-Token', authToken)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('id');
        res.body.should.have.property('isPublished').eql(true);
        done();
      });
  });

  // Test PUT /files/:id/unpublish
  it('should unpublish a file by id', (done) => {
    const fileId = 'file_id_to_unpublish'; // replace with actual file id
    chai.request(server)
      .put(`/files/${fileId}/unpublish`)
      .set('X-Token', authToken)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('id');
        res.body.should.have.property('isPublished').eql(false);
        done();
      });
  });

  // Test GET /files/:id/data
  it('should return file data by id', (done) => {
    const fileId = 'file_id_to_get_data'; // replace with actual file id
    chai.request(server)
      .get(`/files/${fileId}/data`)
      .set('X-Token', authToken)
      .end((err, res) => {
        res.should.have.status(200);
        res.text.should.be.a('string');
        done();
      });
  });
});
