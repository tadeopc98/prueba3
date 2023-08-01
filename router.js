const express = require('express');
const router = express.Router();
const createConnection = require('./database');
const connection = createConnection();
const crud = require('./controllers/crud');



router.get('/editUser/:id', (req, res) => {
  const id = req.params.id;
  connection.query('SELECT * FROM usuarios WHERE idUsuario=?', [id], (error, results) => {
    if (error) {
      throw error;
    } else {
      res.render('editUser.ejs', { user: results[0] });
    }
  });
});


router.get('/deleteUser/:id', (req, res) => {
  const id = req.params.id;
  connection.query('DELETE FROM usuarios WHERE idUsuario = ?', [id], (error, results) => {
    if (error) {
      console.log(error);
    } else {
      res.redirect('/dashboard/UsersControlAdmin');
    }
  });
});




router.post('/saveUser', crud.saveUser);
router.post('/updateUser', crud.updateUser);
router.post('/saveClient', crud.saveClient);


module.exports = router;
