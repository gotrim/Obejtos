// ==========================================================
// 1. Obtém os elementos do DOM após o carregamento da página
// ==========================================================
const base = document.getElementById("base");
console.log(base);
if (!base) {
    console.error("Canvas não encontrado");
    throw new Error("Canvas ausente");
}

base.width = 400;
base.height = 400;
    // ___________________
    //| Tamanho do canvas |
    //|___________________|

// ==========================================================
// 2. Elementos de controle (botões)
// ==========================================================
const bntEsq = document.getElementById("bntEsq");
const bntDir = document.getElementById("bntDir");
const bntCim = document.getElementById("bntCim");
const bntBai = document.getElementById("bntBai");
const bntPos = document.getElementById("bntPos");
const bntNeg = document.getElementById("bntNeg");
const bntPara = document.getElementById("bntPara");
const bntReset = document.getElementById("bntReset");
const bntVertices = document.getElementById("bntVertices");

if (!bntReset || !bntDir|| !bntPos || !bntNeg || !bntEsq || !bntBai || !bntCim || !bntPara || !bntVertices) {
    console.error("Botões não encontrados");
}

// ==========================================================
// 3. Contexto de desenho e variáveis globais
// ==========================================================
const con = base.getContext("2d");
                            // _______________________________________________________________
const FPS = 30;             //| Quadros por segundo                                           |
const dt = 1 / FPS;         //| Intervalo de tempo entre quadros                              |
const passo = Math.PI / 10; //| Passo de rotação manual (18°)                                 |
const Zoom = 0.2;           //| Passo de zoom                                                 |
const minDz = 0.2;          //| Distância mínima da câmera                                    |
const maxDz = 5;            //| Distância máxima da câmera                                    |
                            //|---------------------------------------------------------------|
let dz = 1;                 //| Distância da câmera (ajusta o tamanho aparente do objeto)     |
let angulo = 0;             //| Ângulo atual de rotação (Y)                                   |
let anguloX = 0;            //| Ângulo atual de rotação (X)                                   |
let direcao = 0;            //| 1 = horário, -1 = anti-horário, 0 = parado          (Y) (⬅)  |
let direcaoX = 0;           //| 1 = horário, -1 = anti-horário, 0 = parado          (X) (⬆)  |
let ultimaDir = 1;          //| Última direção ativa (para quando a pausa é desligada)        |
let ultimaDirX = 1;         //| Última direção ativa (para quando a pausa é desligada)       |
let pausa = false;          //| Controla se a animação de rotação está pausada                |
let mostrarVertices = false; //| Exibe ou oculta os vértices (pontos)                          |
                            //|_______________________________________________________________|

const fundo = "#1A1A1A";
const interior = "#72F2DB";

// ==========================================================
// 4. Vértices do Objeto (coordenadas 3D)
// ==========================================================
const vs = [
    //                                    ___
    { x:  0.125, y:      0, z:  0.25 },//| 0 |
    { x: -0.125, y:      0, z:  0.25 },//| 1 |
    { x: -0.062, y: -0.125, z:  0.25 },//| 2 |
    { x:  0.062, y: -0.125, z:  0.25 },//| 3 |
    { x:      0, y:  0.125, z:  0.25 },//| 4 |
    //                                   |---|
    { x:  0.125, y:      0, z: -0.25 },//| 5 |
    { x: -0.125, y:      0, z: -0.25 },//| 6 |
    { x: -0.062, y: -0.125, z: -0.25 },//| 7 |
    { x:  0.062, y: -0.125, z: -0.25 },//| 8 |
    { x:      0, y:  0.125, z: -0.25 },//| 9 |
    //                                   |___|
];

// ==========================================================
// 5. Arestas (índices dos vértices para formar as linhas)
// ==========================================================
const fs = [
    [0, 4], [4, 1], [1, 2], [2, 3], [3, 0],
    [5, 9], [9, 6], [6, 7], [7, 8], [8, 5],
    [0, 5], [4, 9], [1, 6], [2, 7], [3, 8],
];

    // _________________________________________________________________________
    //| O objeto é um prisma de base pentagonal (meio losango) com 10 vértices. |
    //| As arestas definem as conexões entre eles, formando um sólido 3D.       |
    //|-------------------------------------------------------------------------|
    //| É possivel adicionar mais porém é um tanto complexo mas gera resultados |
    //|_________________________________________________________________________|

// ==========================================================
// 6. Buffers reutilizáveis (otimização de desempenho)
// ==========================================================
                                    // __________________________________________________________________
                                    //| Em vez de criar novos objetos a cada quadro, pré-alocamos arrays |
                                    //| com objetos fixos que serão atualizados in-place.                |
const numVerts = vs.length;         //|------------------------------------------------------------------|
const lugar = new Array(numVerts);  //| coordenadas 3D após rotação e translação                         |
const tela = new Array(numVerts); //| coordenadas 2D após projeção e mapeamento para tela              |
                                    //|__________________________________________________________________|
for (let i = 0; i < numVerts; i++) {
    lugar[i] = { x: 0, y: 0, z: 0 };
    tela[i] = { x: 0, y: 0 };
}

// ==========================================================
// 7. Funções de transformação 
// ==========================================================
function atualiza() {
    const c = Math.cos(angulo);
    const s = Math.sin(angulo);
    const cX = Math.cos(anguloX);
    const sX = Math.sin(anguloX);
    
    for (let i = 0; i < numVerts; i++) {
        const v = vs[i];
        let x = v.x;
        let y = v.y;
        let z = v.z;
        
        const x1 = x * c - z * s;                                         
        const z1 = x * s + z * c;
        const y1 = y; 

        const y2 = y1 * cX - z1 * sX;                                         
        const z2 = y1 * sX + z1 * cX;
        const x2 = x1;
        
        const lug = lugar[i];
        lug.x = x2;
        lug.y = y2;
        lug.z = z2 + dz;
    }
}

function projetaTodos() {
    const w = base.width;
    const h = base.height;
    for (let i = 0; i < numVerts; i++) {
        const { x, y, z } = lugar[i];
                                        // ______________________________________________
        const zv = Math.max(z, 0.001);  //| Evita divisão por zero                       |
                                        //|----------------------------------------------|
        const px = x / zv;              //| Projeção perspectiva                         |
        const py = y / zv;              //|                                              |
                                        //|----------------------------------------------|
        const t = tela[i];            //| Mapeamento para coordenadas de tela (pixels) |
        t.x = (px + 1) * 0.5 * w;       //|______________________________________________|
        t.y = (py + 1) * 0.5 * h;
    }
}

// ==========================================================
// 8. Funções de desenho
// ==========================================================
function limpar() {
    con.fillStyle = fundo;
    con.fillRect(0, 0, base.width, base.height);
    // ________________________
    //| Limpa o canvas (fundo) |
    //|________________________|
}

function desenharArestas() {
    con.strokeStyle = interior;
    for (const [i, j] of fs) {
        const p1 = tela[i];
        const p2 = tela[j];
        con.beginPath();
        con.moveTo(p1.x, p1.y);
        con.lineTo(p2.x, p2.y);
        con.stroke();
    }
}

function desenharVertices() {
    if (!mostrarVertices) return;
    con.fillStyle = interior;       // __________________
    const tamanho = 10;             //| lado do quadrado |
    for (const { x, y } of tela) {//|__________________|
        con.fillRect(x - tamanho/2, y - tamanho/2, tamanho, tamanho);
        // _____________________________________________________
        //| Desenha um pequeno quadrado centralizado no vértice |
        //|_____________________________________________________|
    }
}

// ==========================================================
// 9. Loop principal de animação
// ==========================================================
let ultimoTempo = 0;
function loop(agora) {                      
                                            // _______________________________________________________________
    if (agora - ultimoTempo >= 1000 / FPS) {//| Controle de FPS para manter a mesma velocidade original       |
        ultimoTempo = agora;                //|                                                               |
                                            //|---------------------------------------------------------------|
        angulo += direcao * Math.PI * dt;   //| Atualiza o ângulo conforme a direção (X)                      |
                                            //|---------------------------------------------------------------|
        anguloX += direcaoX * Math.PI * dt;  //| Atualiza o ângulo conforme a direção (Y)                      |
                                            //|---------------------------------------------------------------|
        atualiza();                         //| 1. Transforma todos os vértices de uma só vez                 |
                                            //|---------------------------------------------------------------|
        projetaTodos();                     //| 2. Projeta todos os vértices para a tela                      |
                                            //|---------------------------------------------------------------|
        limpar();                           //| 3. Limpa o canvas                                             |
                                            //|---------------------------------------------------------------|
        desenharArestas();                  //| 4. Desenha as arestas usando os índices predefinidos          |
                                            //|---------------------------------------------------------------|
        desenharVertices();                 //| 5. Desenha os vértices (se ativado)                           |
                                            //|_______________________________________________________________|
    }

    requestAnimationFrame(loop);
}

// ==========================================================
// 10. Eventos dos botões
// ==========================================================
bntEsq.addEventListener("click", () => {
    ultimaDir = -1;
        if (pausa) {
        angulo -= passo;
    } else {
        direcao = -1;
    }
});

bntDir.addEventListener("click", () => {
    ultimaDir = 1;
    if (pausa) {
        angulo += passo;
    } else {
        direcao = 1;
    }
});

bntPos.addEventListener("click", () => {
    ultimaDirX = 1;
    if (pausa) {
        anguloX += passo;
    } else {
        direcaoX = 1;
    }
});

bntNeg.addEventListener("click", () => {
    ultimaDirX = -1;
    if (pausa) {
        anguloX -= passo;
    } else {
        direcaoX = -1;
    }
});

bntReset.addEventListener("click", () => {
    angulo = 0;
    anguloX = 0;
    dz = 1;
});

bntCim.addEventListener("click", () => {
    dz = Math.max(dz - Zoom, minDz);
});

bntBai.addEventListener("click", () => {
    dz = Math.min(dz + Zoom, maxDz);
});

bntPara.addEventListener("click", () => {
                                  // _____________________________
    pausa = !pausa;               //| Alterna o estado de pausa   |
    if (pausa) {                  //|-----------------------------|
        direcao = 0;              //| Para a rotação automática   |
        direcaoX = 0;             //| Ícone de "play"             | 
        bntPara.textContent = "▸";//|                             |
    } else {                      //|-----------------------------|
        direcao = ultimaDir;  //| Retoma com a última direção |
        direcaoX = ultimaDirX; //| Ícone de "pause"            |
        bntPara.textContent = "⏸";
    }                             //|_____________________________|
});

bntVertices.addEventListener("click", () => { //             _________________________________
    mostrarVertices = !mostrarVertices;                   //| Alterna visibilidade dos pontos |
    bntVertices.textContent = mostrarVertices ? "◉" : "○";//| Muda ícone                      |
}); //                                                      |_________________________________|

// ==========================================================
// 11. Inicia a animação
// ==========================================================
requestAnimationFrame(loop);