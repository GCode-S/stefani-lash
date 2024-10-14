function pagAgends(){
    window.location.href = './agends.html';
}

function pagNewClient(){
    window.location.href='./newClient.html';
}

function configurate(){
    window.location.href='./configs.html';
}

function information(num){
    window.location.href='./information.html?id='+num;
}

function editAgend(num){
    window.location.href='./edit.html?id='+num;
}

function newAgend(){
    window.location.href='./edit.html?id=new';
}

function home(){
     window.location.href='./index.html';
}
function openWhats(num){
    window.open('http://wa.me/55'+num);
}


// Banco de Dados

async function openDB(){
    return new Promise((res, rej) =>{
        const req = indexedDB.open('lashDB',1);

        req.onerror = function(event){
            rej("Erro ao abrir o DB");
            alert("Erro ao abrir o DB");
        };

        req.onsuccess = function(event){
            const db = event.target.result;
            console.log("Open the DB");
            res(db);
        };

        req.onupgradeneeded = function (event){
            const db = event.target.result;
            if(!db.objectStoreNames.contains('clientes')){
                var cliente = db.createObjectStore('clientes', {keyPath: 'id', autoIncrement: true});
                cliente.createIndex('nome', 'nome', { unique: false});
                cliente.createIndex('cpf', 'cpf', { unique: true});
                cliente.createIndex('data', 'data', { unique: false});
                cliente.createIndex('numero', 'numero', { unique: false});
                cliente.createIndex('tipo', 'tipo', { unique: false});
                cliente.createIndex('curvatura', 'curvatura', { unique: false});
                cliente.createIndex('comprimento', 'comprimento', { unique: false});
                cliente.createIndex('espessura', 'espessura', { unique: false});
                cliente.createIndex('mapping', 'mapping', { unique: false});
                cliente.createIndex('marca', 'marca', { unique: false});
                cliente.createIndex('cola', 'cola', { unique: false});
            
                var agenda = db.createObjectStore('agenda', {keyPath:'id', autoIncrement: true});
                agenda.createIndex('idCliente','idCliente', { unique: true});
                agenda.createIndex('data','data', {unique: false});
                agenda.createIndex('hora','hora', {unique: false});
                agenda.createIndex('valor','valor', {unique: false});
            }
        };

    })
}


async function exibirProper(namedb){
    const db = await openDB();

    return new Promise((res, rej) =>{
        var transaction = db.transaction([namedb], 'readonly');
        var store = transaction.objectStore(namedb);
        var req = store.openCursor();
        
        var data = [];
        

        req.onsuccess = function( event) {
            const dados  = event.target.result;

            if(dados){
                if(namedb == 'clientes'){
                    data.push({
                        id: dados.key,
                        nome: dados.value.nome,
                        cpf: dados.value.cpf,
                    });
                    dados.continue();
                }else{
                    data.push({
                        id: dados.key,
                        data: dados.value.data,
                        hora: dados.value.hora,
                        idCliente: dados.value.idCliente
                    });
                    dados.continue();
                }
                
            }else{
                res(data);
            }

            // console.log(data);
            // res(dados);
            // console.log(dados)

            
            
            
        }
 
        req.onerror = function(event ){
            rej("Erro ao obter os dados.");
            alert("Erro ao obter dados dos Clientes.");
        }

    })
}

var agendados = [];

async function exibir(name){
    try{

        const clientes = await exibirProper("clientes");
        const agenda = await exibirProper("agenda");
        agendados = [];
         console.log(agenda);
         console.log(clientes);

        for(var i = 0; i < clientes.length; i++){

            for(var a = 0; a < agenda.length; a++){
                if(clientes[i].id == agenda[a].idCliente){
                    agendados.push({
                        id: clientes[i].id,
                        nome: clientes[i].nome,
                        data: agenda[a].data,
                        hora: agenda[a].hora,
                        idCliente: agenda[a].id
                    });
                }
            }
        }

        // console.log(agendados);
        const org =  agendados.sort((a, b ) => new Date(`${a.data}T${a.hora}`) - new Date(`${b.data}T${b.hora}`));
        agendados = org;
        const age  = agendados.map(cliente =>{

            const date = new Date(cliente.data);
            const day = date.getDate() + 1;
            const month = date.getMonth() + 1;
            const year = date.getFullYear();

           return `
                    <div class="item">

                        <div class="header_cards">
                            <button class="header_button" onclick="information(${cliente.id});" style="background-image: url('../icons/mdi_information-outline.png');"></button>
                            <ul id="name_ul">${cliente.nome}</ul>
                            <button class="header_button" onclick="editAgend(${cliente.id})" style="background-image: url('../icons/bx_edit.png');"></button>
                        </div>

                        <div class="info_cards">
                            <ul class="ul">
                                data: ${day}/${month}/${year}
                            </ul>
                            <ul class="ul">
                                horário: ${cliente.hora}
                            </ul>
                        </div>

                        <div class="lin"></div>

                        <div class="actions_cards">
                            <button class="actions_button" style="background-image: url('../icons/mdi_bin.png'); color:#FF7676" onclick="deletar(${cliente.idCliente}, 'agenda')">descartar</button>
                            <button class="actions_button" style="background-image: url('../icons/Vector.png');color:#7381FF;background-position-x:right;" onclick="deletar(${cliente.idCliente}, 'agenda', 'concluido')">concluido</button>
                        </div>
                    </div>
            `
        });
        document.getElementById("cards").innerHTML  = age.join("");
        // console.log(clientes)
        // console.log(agendados);
    }catch(e){
        console.log("erro",e);
    }
}



//pag agends
var listClient = [];

async function getInfoClient(){
    
    const db = await openDB();

    return new Promise((res, rej) =>{
        const transaction = db.transaction(["clientes"], "readonly");
        const store = transaction.objectStore("clientes");
        const req = store.openCursor();

        const data = [];

        req.onsuccess = function(e){

            const dados =  e.target.result;

            if(dados){
                data.push({
                    id: dados.key,
                    nome: dados.value.nome,
                    cpf: dados.value.cpf
                });

                dados.continue();
            }else{
                res(data);
                listClient = data;
            }
        }

        req.onerror = function (e){
            alert("Erro ao exibir Dados dos Clientes");
            rej("error")
        }




    })
    
}



async function resultGetInfoClient(){
    try{

        const resultList = await getInfoClient();
        const componets = resultList.map(cliente=>{
            return `
            <div class="item">

                        <div class="">
                                    <ul id="name_ul">${cliente.nome}</ul>
                        </div>

                        <div class="info_cards" style="align-items: center;">
                            <ul class="ul">
                                CPF: ${cliente.cpf}
                            </ul>
                             <button class="header_button" onclick="information(${cliente.id});" style="background-image: url('../icons/mdi_information-outline.png');"></button>
                        </div>

   

                        <div class="actions_cards">
                            <button class="actions_button_blue" onclick="editAgend(${cliente.id})" style="background-image: url('../icons/mdi_alarm-clock-add\ \(1\).png'); ">Agendar Horário</button>
                        </div>
            </div>
            `;
        });

        document.getElementById("cards").innerHTML = componets.join("");

        


    }catch(e){
        console.log(e);
        alert("Erro ao Exibir Dados");
    }
}



async  function cadastrarClient(){
    const db = await openDB();

    return new Promise ((res, rej)=>{
    const uniqueRandom = Math.floor(Math.random() * Date.now());
    var regs = {
        nome: document.getElementById("nome").value,
        cpf: uniqueRandom , 
        data: 0,
        numero: document.getElementById("numero").value,
        tipo: document.getElementById("tipo").value,
        curvatura: document.getElementById("curvatura").value,
        comprimento: document.getElementById("comprimento").value,
        espessura: document.getElementById("espessura").value,
        mapping: document.getElementById("mapping").value,
        marca: document.getElementById("marca_fios").value,
        cola: document.getElementById("cola").value,


    };

    if (regs.nome.length == 0){
        console.log("nome vazio");
        alert("preencha os campos necessários para continuar.")
        return
    }

    var datac = document.getElementById("data").value;
    var hora = document.getElementById("hora").value;

    var transaction = db.transaction(["clientes"], "readwrite");
    var storecliente = transaction.objectStore("clientes");
    var req = storecliente.add(regs);
    
    var clientId

    req.onsuccess =  function(event){
        clientId =  event.target.result;
       

        if (datac.length != 0 && hora.length != 0){
            console.log("hora/data");

            var agends = {
                idCliente: clientId,
                data:datac,
                hora: hora,
                valor: document.getElementById("valor").value,
    
            };
    
            var trans = db.transaction(['agenda'], 'readwrite');
            var str = trans.objectStore('agenda');
            var r = str.add(agends);
    
            r.onsuccess = function(event){
                console.log("agendamento marcado");
            }
    
            r.onerror = function(event){
                console.log('erro ao fazer agendamento');
            }
    
        }

        alert('Cliente cadastrado', clientId);

        console.log('Cliente cadastrado', clientId);
        res('Cliente cadastrado');
        home();
    }
    
    req.onerror = function(event){
        alert('Erro ao cadastrar');
        rej(event);
    }

    
    })
}



async function cadastrar(){
    try{
        await cadastrarClient();
    }catch(e){
        console.log("Erro ao cadastrar um novo Cliente", e);
    }
}


async function deleteDB(id, name, msg){
    const db = await openDB();
     
    return new Promise((res, rej) =>{
        if(msg == 'concluido'){
            var result = confirm("Tem certeza que deseja concluir esta "+ name);
        }else{
            var result = confirm("Tem certeza que deseja deletar "+ name);
        }
       
        

        if(result == true){

            const  transaction = db.transaction([name], 'readwrite'); 
            const objectStore = transaction.objectStore(name);
            
            const req = objectStore.delete(id);
           

            req.onsuccess = function(e) {
                if(name == 'agenda'){
                    return exibir();
               }else{
                    return pagAgends();
               }
                // alert(name+" deletado com sucesso!");
            }

            req.onerror = function(e){
                alert("Erro ao deletar " + name+ "!");
                
            }
        }else{
            if(msg == 'concluido'){
                alert("Você desistiu de concluir esta "+ name + "!");
            }else{
                alert("Você desistiu de deletar esta "+ name + "!");
            }
            
            console.log(id);
        }
    });
}
 
async function deletar(id, name, msg){
    try{
       await deleteDB(id, name, msg);
       
        
    }catch(e){
        alert("Erro ao deletar");
        console.log(e);
    }
};






async function exibirUser(id, name){

    const db = await openDB();

    return new Promise ((res, rej) =>{
        
        
        const  transaction = db.transaction([name]); 
        const store = transaction.objectStore(name);
        
        var req;

        if(name == "agenda"){
            const ind = store.index("idCliente");
            req = ind.get(id);
        }else{
            req = store.get(id)
        }

        req.onsuccess = function(e) {
            const dados = e.target.result;
            if(dados){
                res(dados);
            }else{
                const vdados = {data:'',hora:'', valor: ''};

                res(vdados);
            }
           

        }

        req.onerror = function(e){
            alert("Erro ao Obter o dados");
        }


    });
}


async function getAllUser(id){
    try{

        const dataAge  = await exibirUser(id, "agenda");
        const dadosAge = await exibirUser(id, "clientes");
        const cardsDIV = document.getElementById("cards");  
        //  return console.log(dataAge);
    

        const list =
        `<div class="item">

                <div>
                    <ul>${dadosAge.nome}</ul>
                </div>

                <div class="info_cards">
                    <ul class="ul" >
                        Data: ${dataAge.data}
                    </ul>
                    <ul  class="ul" >
                        Horário:  ${dataAge.hora}

                    </ul>
                </div>

                <div  class="info_cards">
                    <ul class="ul">
                        Tipo:  ${dadosAge.tipo}
                    </ul>
                    <ul class="ul">
                        Curvatura:  ${dadosAge.curvatura}
                    </ul>
                </div>

                <div class="info_cards">
                    <ul class="ul">
                        Espessura:  ${dadosAge.espessura}
                    </ul>
                    <ul class="ul">
                        Mapping:  ${dadosAge.mapping}
                    </ul>
                </div>

                <div class="info_cards">
                    <ul >
                        Marca dos Fios: ${dadosAge.marca}
                    </ul>
                </div>  

                <div class="info_cards">
                    <ul >
                        Cola Utilizada: ${dadosAge.cola}
                    </ul>
                </div>  

                <div class="info_cards">
                    <ul>
                        Número de Contato: ${dadosAge.numero}
                    </ul>
                </div>  

                <button onclick="openWhats(${dadosAge.numero})" class="bnt_whats" style="background-image: url('../icons/ic_baseline-whatsapp.png');">Whatsapp</button>

            </div>
             `;
            cardsDIV.innerHTML  = list;



    }catch(e){
        alert("erro ao buscar dados");
        console.log(e)
    }
}





function filterClient(){

    const input = document.getElementById("search").value.toLowerCase();
    const filterData = listClient.filter(i => i.nome.toLowerCase().includes(input));
    const resultDiv = document.getElementById("cards");
    resultDiv.innerHTML = '';

    if (filterData.length > 0){

        const filtro = filterData.map(cliente =>{
            return `
            
            <div class="item">

                        <div class="header_cards">
                            <button class="header_button" onclick="information(${cliente.id});" style="background-image: url('../icons/mdi_information-outline.png');"></button>
                            <ul id="name_ul">${cliente.nome}</ul>
                            <button class="header_button" onclick="editAgend(${cliente.id})" style="background-image: url('../icons/bx_edit.png');"></button>
                        </div>

                        <div class="info_cards">
                            <ul class="ul">
                                CPF: ${cliente.cpf}
                            </ul>
                        </div>

   

                        <div class="actions_cards">
                            <button class="actions_button_blue" onclick="newAgend()" style="background-image: url('../icons/mdi_alarm-clock-add\ \(1\).png'); ">Agendar Horário</button>
                        </div>
            </div>

            `;
        })

        document.getElementById("cards").innerHTML = filtro.join("");

    }else{
        resultDiv.innerHTML = '<label style="padding:100px">Nenhuma agenda encontrada</label>';
    }


}

function filterResults(){
    const input = document.getElementById("searchInput").value.toLowerCase();
    const filterData = agendados.filter(i => i.nome.toLowerCase().includes(input));
    const resultDiv = document.getElementById("cards");
    resultDiv.innerHTML ='';

    if(filterData.length > 0){
        const age  = filterData.map(cliente =>{
            return `
                     <div class="item">
 
                         <div class="header_cards">
                             <button class="header_button" onclick="information(${cliente.id});" style="background-image: url('../icons/mdi_information-outline.png');"></button>
                             <ul id="name_ul">${cliente.nome}</ul>
                             <button class="header_button" onclick="editAgend(${cliente.id})" style="background-image: url('../icons/bx_edit.png');"></button>
                         </div>
 
                         <div class="info_cards">
                             <ul class="ul">
                                 data: ${cliente.data}
                             </ul>
                             <ul class="ul">
                                 horário: ${cliente.hora}
                             </ul>
                         </div>
 
                         <div class="lin"></div>
 
                         <div class="actions_cards">
                             <button class="actions_button" style="background-image: url('../icons/mdi_bin.png'); color:#FF7676">descartar</button>
                             <button class="actions_button" style="background-image: url('../icons/Vector.png');color:#7381FF;background-position-x:right;">concluido</button>
                         </div>
                     </div>
             `
         });
         document.getElementById("cards").innerHTML  = age.join("");
    }else{
        resultDiv.innerHTML = '<label>Nenhuma agenda encontrada</label>';
    }
}

async function loadEdit(id){
    
    const agenda = await exibirUser(id,"agenda");
    const clientes = await exibirUser(id, "clientes");
    // console.log(clientes);

    document.getElementById("name").textContent = clientes.nome;
    document.getElementById("numero").value = clientes.numero;
    document.getElementById("tipo").value = clientes.tipo;
    document.getElementById("curvatura").value = clientes.curvatura;
    document.getElementById("espessura").value = clientes.espessura;
    document.getElementById("marca_fios").value = clientes.marca;
    document.getElementById("comprimento").value = clientes.comprimento;
    document.getElementById("mapping").value = clientes.mapping;
    document.getElementById("cola").value = clientes.cola;
    document.getElementById("data").value = agenda.data;
    document.getElementById("hora").value = agenda.hora;
    document.getElementById("valor").value = agenda.valor;

    

}

async function updateDB(id){
    const db = await openDB();

    return new Promise((res, rej) =>{

        const transactionCliente = db.transaction(['clientes'], 'readwrite');
        const storeCliente = transactionCliente.objectStore('clientes');

        const transactionAgenda = db.transaction(['agenda'], 'readwrite');
        const storeAgenda = transactionAgenda.objectStore('agenda');


        var requestUpdate

        var index = storeAgenda.index('idCliente');
        var reqAgenda = index.get(id);

        var reqCliente = storeCliente.get(id);

        

        reqCliente.onsuccess = function(e){
           
                var cliente = e.target.result;

                cliente.numero = document.getElementById("numero").value;
                cliente.tipo = document.getElementById("tipo").value;
                cliente.curvatura = document.getElementById("curvatura").value;
                cliente.espessura = document.getElementById("espessura").value;
                cliente.marca = document.getElementById("marca_fios").value;
                cliente.comprimento = document.getElementById("comprimento").value;
                cliente.mapping = document.getElementById("mapping").value;

                reqCliente = storeCliente.put(cliente);

                reqCliente.onsuccess = function(e) {
                    console.log("Cliente atualizado com sucesso");
                    // pagAgends();
                };
                reqCliente.onerror = function(e) {
                    console.log(e);
                    
                };
           
        };

        reqCliente.onerror = function(e){
            alert("Erro ao alterar os dados!");
            console.log(e);
        };

        reqAgenda.onsuccess = function(e){

            var agenda = e.target.result;

            // return console.log(agenda);
            if(agenda){
                agenda.data = document.getElementById("data").value;
                agenda.hora = document.getElementById("hora").value;
                agenda.valor = document.getElementById("valor").value;

                reqAgenda = storeAgenda.put(agenda);
                console.log("Agenda atualizado com sucesso");

            }else{
                const data = {
                    idCliente: id,
                    data :document.getElementById("data").value,
                    hora :document.getElementById("hora").value,
                    valor: document.getElementById("valor").value,
                }

                storeAgenda.add(data);
                console.log("Agenda criada com sucesso");
            }
        }

        reqAgenda.onerror = function(e){
            console.log(e);
        }

        pagAgends();

    });
}

async function update(id){

    try{

        await updateDB(id);
       

    }catch(e){

        alert("Erro ao Alterar dados.");
        console.log(e);

    }
}


function apagarBancoDeDados() {
    const deleteRequest = indexedDB.deleteDatabase('lashDB');

    deleteRequest.onsuccess = function() {
      console.log('Banco de dados apagado com sucesso');
    };

    deleteRequest.onerror = function(event) {
      console.log('Erro ao apagar o banco de dados:', event.target.errorCode);
    };

    deleteRequest.onblocked = function() {
      console.log('A operação de apagar o banco de dados foi bloqueada.');
    };
}




async function findDates(data){
    const db = await openDB();

    return new Promise((res, rej) =>{

        const transaction = db.transaction(['agenda'], 'readonly');
        const store = transaction.objectStore('agenda');
        const index = store.index("data");

        const req = index.openCursor(data);
        const hors = [];

        var lab ="<label>Horarios marcados neste mesmo dia</label>"; 
        // var lab; 
        req.onsuccess = function (e){

            const resp = e.target.result;

            if(resp){
                hors.push(resp.value);
                resp.continue();
                console.log("neste dia você tem agenda");
            }else{
                res(hors)
            }

            return hors;

           
                
           
            
        }

        req.onerror = function(e){
            console.log(e);
        }



    });
} 

async function findDate(data){
    try{

        const hors = await findDates(data);

        if(hors){
            const componets = hors.map(cliente=>{
                return `
                    <label>${cliente.hora}</label>
                `;
            });

            if(componets.length != 0){
                document.getElementById("resultData").innerHTML = "<label>Horarios marcados neste mesmo dia</label>"+ componets.join("");;
            }else{
                document.getElementById("resultData").innerHTML = '';
            }
           
    
        }
        
    }catch (e){
        console.log("erro" +e);
    }
}


async function getAgenda(name){
    const db = await openDB();

    return new Promise((res, rej) =>{

        const transaction = db.transaction([name], 'readonly');
        const store = transaction.objectStore(name);

        const req = store.getAll();

        req.onsuccess = function (e){
            res(e.target.result);
        }
        req.onerror = function (e){
            console.log("erro ao transferir agenda");
        }

    });
}

async function backupData() {
    const db = await openDB();
    try{

        const storeAgenda = await getAgenda('agenda');
        const storeClientes = await getAgenda('clientes');

        var dataToBackup = { clientes: [], agenda: [] };

        dataToBackup.clientes = storeClientes;
        dataToBackup.agenda = storeAgenda;
        
        console.log(dataToBackup);

        var jsonData = JSON.stringify(dataToBackup);
        var blob = new Blob([jsonData], { type: "application/json" });
        var a = document.createElement("a");
        var url = URL.createObjectURL(blob);
        a.href = url;
        a.download = "backup.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
    }catch{
        alert("erro ao gerar um backup");
    }
  }

 async function importData() {

    const db = await openDB();
  
        var fileInput = document.getElementById("fileInput");
        var file = fileInput.files[0];
      
        if (file) {
          var reader = new FileReader();
      
          reader.onload = function (e) {
            try {
              var importedData = JSON.parse(e.target.result);
      
              var transaction = db.transaction(["clientes"], "readwrite");
              var objectStore = transaction.objectStore("clientes");
      
              importedData.clientes.forEach(function (clientes) {
                objectStore.add(clientes);
              });

              var trans = db.transaction(['agenda'], 'readwrite');
              var obj = trans.objectStore('agenda');

              importedData.agenda.forEach(function (agenda){
                obj.add(agenda);
              })

      
              
              alert("Dados importados com sucesso!");
            } catch (error) {
              console.error("Erro ao importar dados:", error);
              alert("Erro ao importar dados. Verifique o formato do arquivo.");
            }
          };
      
          reader.readAsText(file);
        } else {
          alert("Selecione um arquivo para importar.");
        }
   
    
  }
