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
function pont({x, y}){
    const s = 20;
    con.fillStyle = interior;
    con.fillRect(x,  y,  s,  s);
    //                |largu |altu | ( so pra lembrar )
}
function tela(p){
    // -1..1 => 0..2 => 0..1 => 0..so Deus sabe
    return {
        x: (p.x + 1)/2*base.width,
        y: (p.y + 1)/2*base.height,
    }
}

limpar();
pont(tela({x: 0, y: 0}));