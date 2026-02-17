// ==========================================================
// 1. Obtém os elementos do DOM após o carregamento da pagina
// ==========================================================
const base = document.getElementById("base");
console.log(base);
if (!base){
    console.error("Canvas não encontrado");
    throw new Error("Canvas ausente");
}

base.width = 400;
base.height = 400;
    // __________________
    //| Tamanho do cavas |
    //|__________________|

// ==========================================================
// 2. Elemento de controle
// ==========================================================

const bntEsq = document.getElementById("bntEsq");
const bntDir = document.getElementById("bntDir");
const bntPara = document.getElementById("bntPara");

if(!bntDir || !bntEsq || !bntPara) {
    console.error("Botões não encontrados");
}

// ==========================================================
// 3. Contexto de desenho e variáveis globais
// ==========================================================

const con = base.getContext("2d");
const FPS = 30;
const dt = 1/FPS;
const angP = Math.PI * dt;

//                       _______________________________________________________________
let dz = 1;           //| Distancia da câmera (dependendo do tamanho do Obejto diminua) |
let angulo = 0;       //| Ângulo atual de rotação                                       |
let direcao = 1;      //| 1 = horário, -1 = anti-horario                                |
let ultimaDirecao = 1 //|                                                               |
let ultimoTempo = 0   //|
let pausa = false     //| Para a animção de rotação                                     |
//                      |_______________________________________________________________|

const fundo = "#1A1A1A";
const interior = "#8DB600";

// ==========================================================
// 4. Vértices do Objeto
// ==========================================================

const vs = [
    {x:  0.125, y:  0.125, z:  0.125}, //0
    {x: -0.125, y:  0.125, z:  0.125}, //1
    {x: -0.125, y: -0.125, z:  0.125}, //2
    {x:  0.125, y: -0.125, z:  0.125}, //3

    {x:  0.125, y:  0.125, z: -0.125}, //4
    {x: -0.125, y:  0.125, z: -0.125}, //5
    {x: -0.125, y: -0.125, z: -0.125}, //6
    {x:  0.125, y: -0.125, z: -0.125}, //7

    {x:  0.25, y:  0.25, z: -0.25}, //8
    {x: -0.25, y:  0.25, z: -0.25}, //9
    {x: -0.25, y: -0.25, z: -0.25}, //10
    {x:  0.25, y: -0.25, z: -0.25}, //11

    {x:  0.25, y:  0.25, z:  0.25}, //12
    {x: -0.25, y:  0.25, z:  0.25}, //13
    {x: -0.25, y: -0.25, z:  0.25}, //14
    {x:  0.25, y: -0.25, z:  0.25}, //15
];

// ==========================================================
// 5. Restas (Indices para desenhar linhas)
// ==========================================================
const fs = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [8, 9], [9, 10], [10, 11], [11, 8],
    [12, 13], [13, 14], [14, 15], [15, 12],

    [0, 4], [1, 5], [2, 6], [3, 7],
    [4, 8], [5, 9], [6, 10], [7, 11],
    [0, 12], [1, 13], [2, 14], [3, 15],
    [8, 12], [9, 13], [10, 14], [11, 15],
];

    // _____________________________________________________________________________
    //| Nesse estudo do eu so utilizei algumas faces e isso gerou um quadrado porem |
    //| com mais faces tudo é possivel                                              |
    //|_____________________________________________________________________________|


// ==========================================================
// 6. Funções auxiliares (geometria)
// ==========================================================

function transformar(v, angulo, dz, destino){
    const c = Math.cos(angulo);
    const s = Math.sin(angulo);
    const x = v.x * c - v.z * s;
    const y = v.y;
    const z = v.x * s + v.z * c + dz;
    destino.x = x;
    destino.y = y;
    destino.z = z;
    // __________________________________________
    //| Rotação no plano XZ (em torno do eixo Y) |
    //|__________________________________________|
}

function projecao(P3d, destino){
    const vz = 1 / P3d.z;
    destino.x = P3d.x * vz;
    destino.y = P3d.y * vz;
    // ________________________
    //| Evita divisão por zero |
    //|________________________|
}
    // __________________________________________________________________
    //| O elemento (Z) controla o plano visto de frente, fazendo objetos |
    //| mais proximos do centro parecerem maior colocando um (Z) menor e |
    //| mais distantes do centro parecerem menor colocando um (Z) maior  |
    //| se colocar um (Z) como 0 ele mão vai aparecer                    |
    //|__________________________________________________________________|

function tela(p, largura, altura, destino){
    destino.x = (p.x + 1) * 0.5 * largura;
    destino.y = (p.y + 1) * 0.5 * altura;
    // _______________________________________________________
    //| Como a função a de cima define tudo com (X) e (Y)     |
    //| essa função normaliza as cordenadas para que o Objeto |
    //| não fuja da Area (A)                                  |
    //|_______________________________________________________|
    // ______________________________________________
    //| -1..1 => 0..2 => 0..1 => 0..* (e por ai vai) |
    //|______________________________________________|
}

// ==========================================================
// 7. Funções de desenho
// ==========================================================

function limpar(){
    con.fillStyle = fundo;
    con.fillRect(0, 0, base.width, base.height);
    // __________________________
    //| Reinicia o (X), (Y), (A) |
    //|__________________________|

}

function linha(p1, p2){
    con.strokeStyle = interior;
    con.beginPath()
    for (const ares of fs) {
        const p1 = projecao[ares[0]];
        const p2 = projecao[ares[1]];
        con.moveTo(p1.x, p1.y);
        con.lineTo(p2.x, p2.y);
    }
    con.stroke();
}

// function pont({x, y}){
//     const a = 20;
//     con.fillStyle = interior;
//     con.fillRect(x - a/2,  y - a/2,  a,  a);
//     // ____________________________________________________________
//     //| Função principal define o (X) eo (Y) assim como a Area (A) |
//     //|____________________________________________________________|
//     // __________________________________________________________
//     //| X (que ta sendo diminido pela metade do espaço da tela)  |
//     //| y (mesma coisa)                                          |
//     //| Largura maxima do espaço                                 |
//     //| Altura maxima do espaço                                  |
//     //|__________________________________________________________|
//     // ( Só pra lembrar oq é cada coisa)
// }

// for (const v of vs){
    // pont(tela(projecao(transa_Z(rotacao_xz(v, angulo), dz))));
    // }
    // _________________________________
    //| Desenha as vértices como pontos |
    //|_________________________________|

// ==========================================================
// 8. Loops principais de animação
// ==========================================================

function loop(tempo){
    //dz += 1*dt; 
    // _______________________________
    //| Distancia e aproxima o Objeto |
    //|_______________________________|

    if (tempo - ultimoTempo < 1000/FPS){
        requestAnimationFrame(loop);
        return;
    }
    ultimoTempo = tempo;
    if (!pausa) angulo += direcao * angP;

    // ______________________________________
    //| Rotaciona e muda a direção do Obejto |
    //|______________________________________|

limpar();

const numV = vs.length;
const P3d = {x: 0, y: 0, z: 0};
const P2d = {x: 0, y: 0};                            
const projecao = new Array(numV);
    
for (let i = 0; i < f.length; ++i){
    transformar(vs[i], angulo, dz, P3d);
    projecao(P3d, P2d);

    projecao[i] = {
        x: (P2d.x + 1) * 0.5 * base.width,
        x: (P3d.x + 1) * 0.5 * base.height,
    }
}
    // _________________________________________________________________
    //| Com isso ele vai pegar o array e fazer uma caminho entre eles   |
    //| começando no ( 0 > 1 | 1 > 2 ) e por ai vai ate chegar no final |
    //|_________________________________________________________________|
     
linha(projecao);

requestAnimationFrame(loop);
    // __________________________________________________________
    //| Usando (DZ) ele esta fazendo uma pequena animação em     |
    //| quadros por segundos (FPS) distanciando todos os obejtos |
    //| com base na velocidade da passagem dos quadros (60)      |
    //|__________________________________________________________|
}
// ==========================================================
// 9. Evetos dos botões
// ==========================================================

bntEsq.addEventListener("click", () => {
    ultimaDirecao = -1;
    if (!pausa){
        direcao = -1;
    }
})
bntDir.addEventListener("click", () => {
    ultimaDirecao = 1;
    if (!pausa){
        direcao = 1;
    }
})
bntPara.addEventListener("click", () => {
    pausa = !pausa;
    if (pausa){
        direcao = 0;
        bntPara.textContent = "▶";
    } else {
        direcao = ultimaDirecao;
        bntPara.textContent = "||";

    }
})

quadros();