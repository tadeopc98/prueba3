const express = require('express');
const flash = require('express-flash');
const app = express();
const session = require('express-session');
app.use(express.urlencoded({extended:false}));
app.use(express.json());
const createConnection = require('./database')
const bodyParser = require('body-parser');
const {createCanvas, loadImage}= require('canvas');
const fs = require('fs');
const port = process.env.PORT || 3000;


const fechaActual = new Date(); //Fecha actual
const horaActual = fechaActual.getHours();
const minActual = fechaActual.getMinutes();
const segActual = fechaActual.getSeconds()
const horaCompleta = horaActual + ':' + minActual + ':' + segActual;
const diaActual = fechaActual.getDate();
const mesActual = fechaActual.getMonth()+1;
const anioActual = fechaActual.getFullYear();
const fechaCompleta = anioActual + '-' + mesActual + '-' + diaActual;

app.use('/', require('./router'));

// Configuración de express-session
app.use(session({
  secret: '123',
  resave: false,
  saveUninitialized: true
}));

app.use(flash());

const connection = createConnection();

app.use(bodyParser.urlencoded({extended:true}));


// Configuración de Express
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Ruta de inicio de sesión
app.get('/', (req, res) => {//DECLARAMOS QUE EL INDEX ES EL INICIO
  res.render('index');
});

const verificarSesion = (req, res, next) => {
  if (req.session && req.session.datos) {
    // El usuario tiene una sesión activa, permitir el acceso a las rutas del panel de control
    next();
  } else {
    // El usuario no tiene una sesión activa, redireccionar al inicio de sesión
    res.redirect('/');
  }
};

// Ruta de validación de inicio de sesión
app.post('/login', (req, res) => { //DESDE HTML EJECUTAMOS EL POST CON NOMBRE /login PARA QUE PODAMOS LLAMARLO
  const { username, password } = req.body; //TRAEMOS LOS DATOS DEL INDEX.HTML QUE SON LOS DATOS DE INICIO DE SESION

  const query = 'SELECT * FROM usuarios WHERE username = ? AND password = ? AND status = ?'; //QUERY PARA OBTENER SI EXISTE UN USUARIO CON ESE USERNAME Y PASSWORD Y QUE ADEMAS ESTE ACTIVO
  connection.query(query, [username, password,'ACTIVO'], (error, results) => { //PASAMOS LOS PARAMETROS AL QUERY Y OBTENEMOS EL RESULTADO O EL ERROR
    if (error) {
      console.error('Error en la consulta:', error); //NOS MUESTRA EN LA CONSOLA SI ES QUE XISTE ALGUN ERROR EN EL QUERY
      res.redirect('/dashboard/admin'); //SI EXISTE UN ERROR NOS REDIRECCIONA A LA PAGINA PRINCIPAL QUE ES EL LOGIN
    } else if (results.length === 1) {//VALIDAMOS SI ENCONTRO UN DATO EN EL QUERY
      const rol = results[0].rol;
      req.session.datos = { //GUUARDAMOS EN EL OBJETO DATOS TODO LO QUE TRAIGAMOS DEL USUARIO EN EL QUERY
        idUsuario: results[0].idUsuario,
        nombre: results[0].nombre,
        noEmpleado: results[0].noEmpleado,
        username: results[0].username,
        password: results[0].password,
        rol: results[0].rol,
        status: results[0].status
      }     
      console.log(req.session.datos);
      
      //VALIDAMOS LOS ROLES PPARA REDIRECCIONAR A LA PAGINA RESPECTIVA
      if (rol === 'ADMINISTRADOR') {
        console.log('entro admin '+ req.session.datos);
        res.redirect('/dashboard/admin');
      }else if (rol === 'SUPERVISOR') {
        res.redirect('/dashboard/operador');
      } else if(rol === 'COORDINADOR'){
        res.redirect('/dashboard/mostrador')
      } else if(rol === 'OPERADOR'){
        res.redirect('/dashboard/handheld')
      } else {
        req.flash('error','Tu rol no es valido, intenta nuevamente')
        res.redirect('/');
        
      }
    } else {
      req.flash('error','Credenciales invalidas. Intentalo Nuevamente');
      res.redirect('/');//SI NO ENCUENTRA NINGUN DATO NOS REDIRECCIONA A LA PAGINA PRINCIPAL NUEVAMENTE
      
    }
  });
});

// Ruta de cierre de sesión
app.get('/logout', (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error('Error al cerrar sesión:', error);
    }
    console.log('Sesion cerrada')
    res.redirect('/');
  });
});


// DECLARAMOS LA Ruta del dashboard del administrador
app.get('/dashboard/admin',verificarSesion, (req, res) => {
  connection.query('SELECT * FROM clientes WHERE diaCarga <= DAY(CURRENT_DATE) + 5 ',(error, results)=>{
    if(error){
        throw error;
    } else {
      const datos = req.session.datos; //OBTENEMOS LA VARIABLE DATOS QUE CREAMOS EN EL METODO DE ARRIBA POST 
  res.render('dashboard_admin.ejs',{results:results,datos}); //PASAMOS EL OBJETO CON LOS DATOS QUE RECUPERAMOS ANTERIORMENTE
  //console.log("this is sede"+grafica:req.session.grafica)
    }   
  })
  
});



app.get('/createUsers', (req,res)=>{
  
          res.render('createUsers');
          
});


app.get('/dashboard/UsersControlAdmin',verificarSesion, (req, res)=>{     
  connection.query('SELECT * FROM usuarios',(error, results)=>{
      if(error){
          throw error;
      } else {
          const datos = req.session.datos;                     
          res.render('dashboardUsersControlAdmin', {results:results,datos});  
          console.log(results);          
      }   
  })
});

app.get('/carteraClientes',verificarSesion, (req, res)=>{     
  connection.query('SELECT * FROM clientes WHERE statusCliente = ?',['ACTIVO'],(error, results)=>{
      if(error){
          throw error;
      } else {
          const datos = req.session.datos;                     
          res.render('carteraClientes', {results:results,datos});  
          console.log(results);          
      }   
  })
});

app.get('/createClient', (req,res)=>{
  connection.query('SELECT  nombreBloque FROM bloques ',(error,results)=>{
      if(error){
          throw error;
      } else {
        connection.query('SELECT MAX(consec) + 1 AS consec FROM folios ',(error,results2)=>{
          if(error){
              throw error;
          } else {
            const opcionesBloque = results.map(row => row.nombreBloque ); 
            const datos = req.session.datos;
          res.render('createClient',{opcionesBloque,client:results2[0],datos});
          console.log(opcionesBloque);
          }
        })
          
      }
  })
  
});



// Iniciar el servidor

app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
