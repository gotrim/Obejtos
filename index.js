console.log(base);

base.width = 800;
base.height = 800;

const con = base.getContext("2d");
const fundo = "#1A1A1A";
const interior = "#8DB600";

console.log(con);

function limpar(){
    con.fillStyle = fundo;
    con.fillRect(0, 0, base.width, base.height);
}
//função principal define o (X) eo (Y) assim com a Area (A)
function pont({x, y}){
    const a = 20;
    con.fillStyle = interior;
    con.fillRect(x - a/2,  y - a/2,  a,  a);
    // X (que ta sendo diminido pela metade do espaço da tela)
    // y (mesma coisa)
    // Largura maxima do espaço 
    // Altura maxima do espaço 
    // ( Só pra lembrar oq é cada coisa)
}

// Como a função a de cima define tudo com (X) e (Y)
// essa função normaliza as cordenadas para que o Objeto
// não fuja da Area (A)
function tela(p){
    // -1..1 => 0..2 => 0..1 => 0..so Deus sabe
    return {
        x: (p.x + 1)/2*base.width,
        y: (p.y + 1)/2*base.height,
    }
}

limpar();
pont(tela({x: 0, y: 0}));