/* parts3d/ports.js — Port-Montage (Claude) für HASHPOOL */
(function(){
  if(typeof THREE === "undefined"){ console.warn("[ports] THREE missing"); return; }
  var P = function(id, role, kind, pos, up, fwd, meta, extra){
    var o = { id:id, role:role, kind:kind, pos:pos, up:up, fwd:fwd, meta:meta||{} };
    if(extra) for(var k in extra) o[k]=extra[k];
    return o;
  };
  var sub=function(a,b){return[a[0]-b[0],a[1]-b[1],a[2]-b[2]];};
  var dot=function(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];};
  var cross=function(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];};
  var len=function(a){return Math.hypot(a[0],a[1],a[2]);};
  var norm=function(a){var l=len(a)||1;return[a[0]/l,a[1]/l,a[2]/l];};
  var I4=function(){return[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];};
  var mul=function(a,b){var o=new Array(16).fill(0);for(var r=0;r<4;r++)for(var c=0;c<4;c++)for(var k=0;k<4;k++)o[r*4+c]+=a[r*4+k]*b[k*4+c];return o;};
  var point=function(m,p){return[m[0]*p[0]+m[1]*p[1]+m[2]*p[2]+m[3],m[4]*p[0]+m[5]*p[1]+m[6]*p[2]+m[7],m[8]*p[0]+m[9]*p[1]+m[10]*p[2]+m[11]];};
  function frame(p, mirror){
    var f=function(v){return mirror?[v[0],-v[1],v[2]]:v;};
    var pos=f(p.pos), x=norm(f(p.fwd)), y=norm(f(p.up)), z=cross(x,y);
    return[x[0],y[0],z[0],pos[0], x[1],y[1],z[1],pos[1], x[2],y[2],z[2],pos[2], 0,0,0,1];
  }
  var FLIP=[1,0,0,0, 0,-1,0,0, 0,0,-1,0, 0,0,0,1];
  var SY=[1,0,0,0, 0,-1,0,0, 0,0,1,0, 0,0,0,1];
  function inv(m){
    var o=[m[0],m[4],m[8],0, m[1],m[5],m[9],0, m[2],m[6],m[10],0, 0,0,0,1];
    o[3]=-(o[0]*m[3]+o[1]*m[7]+o[2]*m[11]);
    o[7]=-(o[4]*m[3]+o[5]*m[7]+o[6]*m[11]);
    o[11]=-(o[8]*m[3]+o[9]*m[7]+o[10]*m[11]);
    return o;
  }
  function mate(hostWorld, hostPort, guestPort){
    var W=mul(mul(hostWorld, frame(hostPort)), FLIP);
    return guestPort.mirror==="y" ? mul(mul(W, inv(frame(guestPort,true))), SY) : mul(W, inv(frame(guestPort)));
  }
  function place(obj, m){
    var c0=[m[0],m[4],m[8]], c1=[m[1],m[5],m[9]], c2=[m[2],m[6],m[10]];
    var det=dot(cross(c0,c1),c2), flip=det<0;
    var r=new THREE.Matrix4().set(m[0],flip?-m[1]:m[1],m[2],0, m[4],flip?-m[5]:m[5],m[6],0, m[8],flip?-m[9]:m[9],m[10],0, 0,0,0,1);
    obj.quaternion.setFromRotationMatrix(r);
    obj.position.set(m[3],m[7],m[11]);
    obj.scale.set(1, flip?-1:1, 1);
    if(obj.updateMatrix) obj.updateMatrix();
    return obj;
  }
  function portOf(part, id){
    var ports=(part.userData&&part.userData.ports)||[];
    for(var i=0;i<ports.length;i++) if(ports[i].id===id) return ports[i];
    throw new Error('Port "'+id+'" fehlt');
  }
  function portsOf(part, role, kind){
    return ((part.userData&&part.userData.ports)||[]).filter(function(p){
      return (!role||p.role===role)&&(!kind||p.kind===kind);
    });
  }
  function mountPart(hostObj, hostPortId, guestObj, guestPortId, guestPort){
    var hostPort=portOf(hostObj, hostPortId), gp=guestPort||portOf(guestObj, guestPortId);
    var hp=hostPort;
    if(hostPort.kind==="rad") hp=Object.assign({}, hostPort, { pos:hostPort.pos.map(function(v,i){return v+hostPort.fwd[i]*((gp.meta&&gp.meta.length)||0)/2;}) });
    var W=mate(hostObj.userData.world||I4(), hp, gp);
    guestObj.userData.world=W; place(guestObj, W);
    return W;
  }
  window.Parts3D = window.Parts3D || {};
  window.Parts3D.Ports = { P:P, I4:I4, mul:mul, point:point, mate:mate, place:place, portOf:portOf, portsOf:portsOf, mountPart:mountPart, inv:inv };
})();
