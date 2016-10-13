var modelo=require('./modelo.js');

describe("El juego niveles incialmente...",function(){
	var juego;

	beforeEach(function(){
		juego=new modelo.Juego();
	});

	it("tiene una coleccion de niveles y usuarios",function(){	
		expect(juego.niveles.length).toEqual(0);
		expect(juego.usuarios.length).toEqual(0);
	});

	it("agregar usuario",function(){
		var usuario=new modelo.Usuario("Pepe");
		juego.agregarUsuario(usuario);

		expect(juego.usuarios[0]).toEqual(usuario);
		expect(juego.usuarios[0].nombre).toEqual("Pepe");
	});

	it("comprobar obtenerUsuario (usuario existente)",function(){
		var usuario=new modelo.Usuario("Pepe");
		juego.agregarUsuario(usuario);		
		var id=usuario.id;
		var usu=juego.obtenerUsuario(id);
		expect(usu.id).toEqual(id);
	});
	it("comprobar obtenerUsuario (usuario no existente",function(){
		var id=00001;
		var usuario=juego.obtenerUsuario(id);
		expect(usuario).toBeUndefined();
	});
})