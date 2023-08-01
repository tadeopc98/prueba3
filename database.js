const mysql = require('mysql2');

function createConnection() {
  const connection = mysql.createConnection({
    host: 'db-mysql-nyc1-34916-do-user-14456800-0.b.db.ondigitalocean.com',
    user: 'doadmin',
    password: 'AVNS_EykNvKZvK_acs6OX1VK',
    database: 'gasunion',
    port: 25060,
    
  });

  connection.connect((error) => {
    if (error) {
      console.error('Error de conexión a la base de datos:', error);
    } else {
      console.log('Conexión exitosa a la base de datos');
    }
  });

  return connection;
}

module.exports = createConnection;
