/** Validação de CNPJ */
function cnpj(cnpj){
	// https://gist.github.com/alexbruno/6623b5afa847f891de9cb6f704d86d02

	let t = cnpj.length - 2,
	d = cnpj.substring(t),
	d1 = parseInt(d.charAt(0)),
	d2 = parseInt(d.charAt(1)),
	calc = x => {
		let n = cnpj.substring(0, x),
			y = x - 7,
			s = 0,
			r = 0

			for (let i = x; i >= 1; i--) {
				s += n.charAt(x - i) * y--;
				if (y < 2)
					y = 9
			}

			r = 11 - s % 11
			return r > 9 ? 0 : r
	}

	return calc(t) === d1 && calc(t + 1) === d2
}

/** Validação do PIS */
function validaPIS(pis) {
	// https://gist.github.com/Tagliatti/0ec719b2997ea7c4bee7
	var multiplicadorBase = "3298765432";
	var total = 0;
	var resto = 0;
	var multiplicando = 0;
	var multiplicador = 0;
	var digito = 99;
	
	// Retira a mascara
	var numeroPIS = pis.replace(/[^\d]+/g, '');

	if (numeroPIS.length !== 11 || 
			numeroPIS === "00000000000" || 
			numeroPIS === "11111111111" || 
			numeroPIS === "22222222222" || 
			numeroPIS === "33333333333" || 
			numeroPIS === "44444444444" || 
			numeroPIS === "55555555555" || 
			numeroPIS === "66666666666" || 
			numeroPIS === "77777777777" || 
			numeroPIS === "88888888888" || 
			numeroPIS === "99999999999") {
			return false;
	} else {
			for (var i = 0; i < 10; i++) {
					multiplicando = parseInt( numeroPIS.substring( i, i + 1 ) );
					multiplicador = parseInt( multiplicadorBase.substring( i, i + 1 ) );
					total += multiplicando * multiplicador;
			}

			resto = 11 - total % 11;
			resto = resto === 10 || resto === 11 ? 0 : resto;

			digito = parseInt("" + numeroPIS.charAt(10));
			return resto === digito;
	}
}

// Coleta de Dados
async function handleFileSelect(evt) {	
	let files = document.querySelector('input[type=file]').files[0];	
	let search = document.querySelector('input[type=text]').value.trim();	

	// 1. Validação do PIS
	if(search) {
		if(!validaPIS(search)){
			alert('Favor informar um PIS válido !!!');
			document.querySelector('#file').value = "";	
			return
		}		
	}

	// 2. Validação do Arquivo
	if (files.type !== "text/plain") {		
		alert("Arquivo de dados inválido !!!")
		document.querySelector('#file').value = "";
		return
	}

	const reader = new FileReader();
	
	reader.readAsText(files);
	
	const result = await new Promise((resolve, reject) => {
		reader.onload = function(event) {
			resolve(reader.result)
		}
	});
	
	// Validação - Tamanho mínimo
	if (result.length <= 394){
		alert("Arquivo de dados inválido !!!");
		document.querySelector('#file').value = "";
		return;
	}

	// Validação CNPJ
	let valor = result.substr(11,14)	
	if (!cnpj(valor)) {
		alert("Arquivo de dados inválido !!!");
		document.querySelector('#file').value = "";
		return
	};	

	// Iniciando Coleta
	let content_file = result	
	let arr_file = content_file.split(/\n/);
	let arr_records = [];	
	let pis = [];
	let pis_title = true;
	let change_day = "";	
	let change_pis = "";	
	let data = "";
	let nsr = "";
	const show_week = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sabado'];

	// Coletando os PIS
	if (!search) {

		arr_file.forEach(i => {
			
			// somente linhas com registro			
			if (i.length == 39) {			
				
				if ( !pis.find(e => i.substr(23,11) == e )) {
					pis.push(i.substr(23,11));
				}						
				
			}
		});		
		
	}else{

		pis.push(search);
	}		

	if(pis.length > 1) {
		arr_records.push('<p class="resul-pis-title">Link Rápido:</p>')
		arr_records.push('<div class="div-link-pis">')
		pis.forEach(pis => {		
			arr_records.push(`<a href="#${pis}" class="link-pis">${pis}</a>`)
		})
		arr_records.push('</div>')
	}


	// Coletando Pis e Registros
	pis.forEach(pis => {		
		pis_title = true;	

		arr_file.forEach(i => {		
			// somente linhas com registro			
			if (i.length == 39) {			
				// filtrando pelo pis					
				if (pis_title) {
					pis_title = false;
					arr_records.push("<p class='resul-pis-title' id='"+pis+"'> PIS: <strong>" + pis + "</strong></p>");
				}					

				if (i.substr(23,11) == pis) {				

					nsr = i.substr(1,9) + "<br>";								
					
					if (i.substr(10,2) != change_day || i.substr(23,11) != change_pis){
						change_day = i.substr(10,2);
						change_pis = i.substr(23,11);
						arr_records.push("<br>");					

						// dia da semana
						week = new Date(i.substr(14,4), i.substr(12,2), i.substr(10,2));
						index = week.getDay();

						data = "<strong>"+
							i.substr(10,2)+ "/" + 
							i.substr(12,2)+ "/" +
							i.substr(14,4)+ "</strong> <span class='span-week'>" + show_week[index-1] +"</span><br><br>" + 
							i.substr(18,2)+ ":" + 
							i.substr(20,2)+ " <span class='span-nsr'>NSR "+nsr+"</span><br>";						
						
					}else{
						data =
							i.substr(18,2)+ ":" + 
							i.substr(20,2)+ " <span class='span-nsr'>NSR "+nsr+"</span><br>";						
					}													
					
					arr_records.push(data);
				}
			}
		});			
	})	

	// No record
	if (arr_records.length == 1){
		document.querySelector('.resul p').innerHTML = "Nenhum registro encontrado para o PIS <strong>" + search + "</strong>.";
		document.querySelector('input[type=text]').value = "";		
		document.querySelector('#file').value = ""	
		return	
	}

	// Show Result	
	var final = arr_records.toString().replace(/\,+/g,'');
	if (final.length==0){
		final = "Nenhum registro encontrado !!!"
	}	

	document.querySelector('.resul p').innerHTML = final		
	document.querySelector('input[type=text]').value = "";		
	document.querySelector('#file').value = ""	
}
 
// Listening for events
document.getElementById('file').addEventListener('change', handleFileSelect, false);	 
