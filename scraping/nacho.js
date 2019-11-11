const puppeteer = require('puppeteer');
const fs = require('fs');
const supermercados = ["COTO", "DIA","Jumbo"]; //Falta Jumbo

let scrape = async () => {

	var fecha = GetCurrentDate() +".csv";
    fs.writeFile(fecha, "Producto;Precio Coto;Precio Promo A;Precio Promo B;Precio Dia;Precio Promo A;Precio Promo B;Precio Jumbo;Precio Promo A;Precio Promo B\n", (err) => {
    	if (err) throw err;
    });


    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto('https://www.preciosclaros.gob.ar/#!/buscar-productos');
    await page.waitFor(5000);
    await page.setViewport({width: 1366, height: 768})

    //Selecciono la direccion correcta
    await page.click('body > main > div:nth-child(2) > section > div.sin-localizacion > div:nth-child(1) > div > p > a');
    await page.waitFor(5000);

    const selectorDireccion = '#address';
    await page.waitForSelector(selectorDireccion);
    await page.type(selectorDireccion, 'Arroyo 880, Ciudad Autonoma de Buenos Aires');
    await page.waitFor(500);
    await page.keyboard.press('ArrowDown');
	await page.keyboard.press('Enter');

    await page.waitFor(5000);
    await page.click('#acceptLink');

    //Leo el CSV de productos y armo el array
    var productosCSV = fs.readFileSync('productos.csv', 'utf8', function(err, contents) {
    	//console.log(contents);
	});
    var productos = productosCSV.substring(0,productosCSV.length - 1).split(";");
	console.log(productos);
    //productos.pop();

	//SCRAPPEO PRECIOS CLAROS:
    for(var k = 0; k < productos.length; k++){
	    // Scrapeo:
	    //await page.click('body > header > section > div > div:nth-child(2) > article > form > div.row.buscador-mayorista > div.col-xs-9.col-sm-8.col-md-8.contenedor-chosen.buscador > div.input-group > input');

		//Saco de la database el siguiente producto
	    await page.waitFor(5000);
	    const selector = 'body > header > section > div > div:nth-child(2) > article > form > div.row.buscador-mayorista > div.col-xs-9.col-sm-8.col-md-8.contenedor-chosen.buscador > div.input-group > input';
		try{
			console.log("busco selector de la barra");
			await page.waitForSelector(selector);
		}catch (err){
			console.log("no lo encontre, pruebo de vuelta");
			await page.waitFor(5000);
			await page.waitForSelector(selector);
		}

	    //Escribo el producto en la barra
	    var producto = productos[k];
		console.log("tipeo en el buscador");
	    await page.type(selector,producto);
	    await page.waitFor(5000);
	    //Clickeo la lupita
		console.log("clickeo la lupita");
			await page.click('body > header > section > div > div:nth-child(2) > article > form > div.row.buscador-mayorista > div.col-xs-9.col-sm-8.col-md-8.contenedor-chosen.buscador > div.input-group > span > i');
	    //clickeo en el producto
	    await page.waitFor(5000);

	    const selectorProducto = 'body > main > div:nth-child(2) > section > div.mayorista.tabla1 > section.resultados > div > div.row > article.col-md-9.col-xs-12.productos.vistaMosaico > div:nth-child(3) > div.col-md-4.col-xs-12.producto.ng-scope > div > div.contenedorProductoEan.ver-detalle-mayorista > div.nombre-producto.ng-binding';
		var productoEncontrado = true;
		try{
			await page.waitForSelector(selectorProducto);
		}catch (error){
			console.log("el producto " + producto + " no se encontro");
			productoEncontrado = false;
		}

	    if(productoEncontrado){
				await page.click(selectorProducto);
				await page.waitFor(5000);
				//FILTRO PRECIOS DE LISTA
				var preciosPCRough = await page.evaluate(function(){
				var todosValores = document.querySelectorAll('span.precio-lista.ng-binding');
				var mistring = "";
				for(var i = 0; i < todosValores.length; ++i) if(todosValores[i].innerText.trim().length > 0) mistring += todosValores[i].innerText.substring(1).replace(",",".") + "あ";
					return mistring;
				});
				var preciosPCSplit = preciosPCRough.split("あ");
			///////////////

				//FILTRO PRECIOS PROMO 1
				//Rough
				var preciosPCPromo1Rough = await page.evaluate(function(){
				var todosValores = document.querySelectorAll('span.precio-promo-1');
				var mistring = "";
				for(var i = 0; i < todosValores.length; ++i){
					if(!todosValores[i].innerText == '' && !todosValores[i].innerText.includes("\n")){
						mistring += todosValores[i].innerText.substring(1).replace(",",".") + "あ";
					}else if(!todosValores[i].innerText.includes("\n")){
						mistring += "N/Aあ";
					}
				}
					return mistring;
				});
				//Split
				var preciosPCPromo1Split = preciosPCPromo1Rough.split("あ");
				//Limpio strings vacios
				preciosPCPromo1Split.pop();
				var preciosPCPromo1Todos = preciosPCPromo1Split;
			/////////////

				//FILTRO PRECIOS PROMO 2
				//Rough
				var preciosPCPromo2Rough = await page.evaluate(function(){
				var todosValores = document.querySelectorAll('span.precio-promo-2');
				var mistring = "";
				for(var i = 0; i < todosValores.length; ++i){
					if(!todosValores[i].innerText == '' && !todosValores[i].innerText.includes("\n")){
						mistring += todosValores[i].innerText.substring(1).replace(",",".") + "あ";
					}else if(!todosValores[i].innerText.includes("\n")){
						mistring += "N/Aあ";
					}
				}
					return mistring;
				});
				//Split
				var preciosPCPromo2Split = preciosPCPromo2Rough.split("あ");
				//Limpio strings vacios
				preciosPCPromo2Split.pop();
				var preciosPCPromo2Todos = preciosPCPromo2Split;

			//////////
				//FILTRO NOMBRES
				var nombresPCRough = await page.evaluate(function(){
				var todosValores = document.querySelectorAll('p.nombre.ng-binding'); //div.col-xs-9.col-md-9.contenedor-descripcion >
				var mistring = "";
				for(var i = 0; i < todosValores.length; ++i) if(todosValores[i].innerText.trim().length > 0) mistring += todosValores[i].innerText + "あ";
					return mistring;
				});

				//console.log(nombresPCRough);
				var nombresPCSplit = nombresPCRough.split("あ");
				//Remuevo todos los strings que tengan "\n"
				var nombresPCTodos = [];
				for(var i = 0; i < nombresPCSplit.length; i++){
					if(!nombresPCSplit[i].includes("\n") && !nombresPCSplit[i] == '') nombresPCTodos.push(nombresPCSplit[i]);
				}

				//Filtro por los supermercados que me interesan: Carrefour, Coto, Dia y Jumbo

				var nombresPC = [];
				var preciosPC = [];
				var preciosPCPromo1 = [];
				var preciosPCPromo2 = [];
				var supers = supermercados;
				for(var i = 0; i < supers.length; i++){
					for(var j = 0; j < nombresPCTodos.length; j++){
						if(nombresPCTodos[j].includes(supers[i])){
							nombresPC.push(nombresPCTodos[j]);
							preciosPC.push(preciosPCSplit[j]);
							preciosPCPromo1.push(preciosPCPromo1Todos[j]);
							preciosPCPromo2.push(preciosPCPromo2Todos[j]);
							break;
						}else if (j == nombresPCTodos.length -1){
							nombresPC.push("N/A");
							preciosPC.push("N/A");
							preciosPCPromo1.push("N/A");
							preciosPCPromo2.push("N/A");
						}
					}
				}

				//Escribo en el archivo en formato CSV
				var csvLine = producto + ";";
				for(var i = 0; i < supermercados.length; i++){
					csvLine += preciosPC[i] + ";" + preciosPCPromo1[i] + ";" + preciosPCPromo2[i];
					if(i != supermercados.length -1) csvLine += ";";
					else csvLine += "\n";
				}

				fs.appendFile(fecha,csvLine,(err) => {
				if (err) throw err;
			});
		}else{
			var csvLine = producto + ";";
				for(var i = 0; i < supermercados.length; i++){
					csvLine += "N/A" + ";" + "N/A" + ";" + "N/A";
					if(i != supermercados.length -1) csvLine += ";";
					else csvLine += "\n";
				}

				fs.appendFile(fecha,csvLine,(err) => {
				if (err) throw err;
			});
		}

		//Vuelvo al menu principal para buscar otro producto
		await page.waitFor(5000);
		await page.goto('https://www.preciosclaros.gob.ar/', {waitUntil: 'load', timeout: 0});
		await page.waitFor(5000);
	}



	console.log('Scrappeo precios claros terminado');

	//SCRAPPEO PRECIOS FISICOS
	//SCRAPPEO COTO
	await page.waitFor(5000);
	console.log('Scrappeo COTO');
	//Meto un salto de linea en el csv
	fs.appendFile(fecha,'\nCOTO\n',(err) => {
			if (err) throw err;
	});
    var urlsCotoString = fs.readFileSync('urlsCoto.csv', 'utf8', function(err, contents) {
    	//console.log(contents);
	});
    var urlsCoto = urlsCotoString.substring(0,urlsCotoString.length - 1).split(";");
	console.log(urlsCoto);
	for(var i = 0; i < urlsCoto.length; i++){
		await page.waitFor(5000);
		try{
			await page.goto(urlsCoto[i]);
		}
		catch(err){
			fs.appendFile(fecha,'Pagina no encontrada' + '\n' ,(err) => {
				if (err) throw err;
		});
			continue;
		}
		var precioRough = await page.evaluate(function(){
		var valor = document.querySelector('span.atg_store_productPrice:nth-child(3) > span:nth-child(1)');
		if(valor != null) return valor.innerText.substring(16, valor.innerText.length);
		else {
			var valorComun = document.querySelector('span.price_regular_precio');
			if(valorComun != null){
				var valorPromo = document.querySelector('span.price_discount');
				if(valorPromo == null) return null;
				return valorComun.innerText.substring(1,valorComun.innerText.length) + "あ" + valorPromo.innerText.substring(1, valorPromo.innerText.length);
			}
			return null;
			}
		});
		//Me fijo si hay promo o no
		if(precioRough == null){
			fs.appendFile(fecha,'producto no encontrado' + '\n' ,(err) => {
					if (err) throw err;
			});
		}else{
			var hayPromo = precioRough.indexOf("あ") > -1 ? true : false;
			//si no hay promo solo printeo valor base
			if(!hayPromo){
				fs.appendFile(fecha,precioRough + ";" + "N/A" + '\n' ,(err) => {
						if (err) throw err;
				});
			}else{
				//printear valor base y promo
				var precios = precioRough.split("あ");
				fs.appendFile(fecha,precios[0] + ';' + precios[1] + '\n' ,(err) => {
						if (err) throw err;
				});
			}
		}
	}
	await page.waitFor(5000);
	console.log('Scrappeo Jumbo');

	//Meto un salto de linea en el csv
	fs.appendFile(fecha,'\nJUMBO\n',(err) => {
			if (err) throw err;
	});
    var urlsJumboString = fs.readFileSync('urlsJumbo.csv', 'utf8', function(err, contents) {
    	//console.log(contents);
	});
    var urlsJumbo = urlsJumboString.substring(0,urlsJumboString.length - 1).split(";");
	console.log(urlsJumbo);
	for(var i = 0; i < urlsJumbo.length; i++){
		await page.waitFor(5000);
		try{
			await page.goto(urlsJumbo[i]);
		}
		catch(err){
			fs.appendFile(fecha,'Pagina no encontrada' + '\n' ,(err) => {
				if (err) throw err;
		});
			continue;
		}
		var precioRough = await page.evaluate(function(){
		var valor = document.querySelector('div.plugin-preco:nth-child(2) > p:nth-child(1) > em:nth-child(2) > strong:nth-child(1)');//.innerText;
		if(valor != null) return valor.innerText;
		else{
			return null;
		}
		});

		if(precioRough == null){
			fs.appendFile(fecha,'producto no encontrado' + '\n' ,(err) => {
					if (err) throw err;
			});
		}else{
			var precio = precioRough.replace(",",".").substring(1,precioRough.length);
			fs.appendFile(fecha,precio + '\n' ,(err) => {
					if (err) throw err;
			});
		}
	}

	//SCRAPPEO DIA
	await page.waitFor(5000);
	console.log('Scrappeo Dia');

	//Meto un salto de linea en el csv
	fs.appendFile(fecha,'\nDIA\n',(err) => {
			if (err) throw err;
	});
    var urlsDiaString = fs.readFileSync('urlsDia.csv', 'utf8', function(err, contents) {
    	//console.log(contents);
	});
    var urlsDia = urlsDiaString.substring(0,urlsDiaString.length - 1).split(";");
	console.log(urlsDia);
	for(var i = 0; i < urlsDia.length; i++){
		await page.waitFor(5000);

		try{
			await page.goto(urlsDia[i]);
		}
		catch(err){
			fs.appendFile(fecha,'Pagina no encontrada' + '\n' ,(err) => {
				if (err) throw err;
		});
			continue;
		}

		var precioRough = await page.evaluate(function(){
			var valor = document.querySelector('.skuBestPrice')
			//busco promos
			var valorSinPromo = document.querySelector('.skuListPrice');
			if(valor != null && valorSinPromo == null) return valor.innerText.replace(",",".").substring(2,valor.length);
			else if(valor != null && valorSinPromo != null) return valorSinPromo.innerText.replace(",",".").substring(2,valorSinPromo.length) + "あ" + valor.innerText.replace(",",".").substring(2,valor.length);
			else return null;
		});
		if(precioRough == null){
			fs.appendFile(fecha,'producto no encontrado' + '\n' ,(err) => {
					if (err) throw err;
			});
		}else{
			var hayPromo = precioRough.indexOf("あ") > -1 ? true : false;
			if(!hayPromo){
				fs.appendFile(fecha,precioRough + ";" + "N/A" +'\n' ,(err) => {
						if (err) throw err;
				});
			}else{
				var precios = precioRough.split('あ');
				fs.appendFile(fecha,precios[0] + ";" + precios[1] +'\n' ,(err) => {
						if (err) throw err;
				});
			}
		}
	}
	console.log('Scrappeo Terminado');
	return;
};

function GetCurrentDate(){
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth() + 1; //January is 0!

	var yyyy = today.getFullYear();
	if (dd < 10) {
	  dd = '0' + dd;
	}
	if (mm < 10) {
	  mm = '0' + mm;
	}
	var today = dd + '-' + mm + '-' + yyyy;
	return today;
}

/*
async function scrapeAllSelector(page, selector){
	var todosValores = await page.evaluate(function(){
    var todosValores = document.querySelectorAll(selector);
    var mistring = "";
    for(var i = 0; i < todosValores.length; ++i) if(todosValores[i].innerText.trim().length > 0) mistring += todosValores[i].innerText + "あ";
        return mistring;
    });
    return todosValores;
}*/

scrape().then((value) => {
    console.log(value); // Success!
});
