import{c as b,j as e,r as S,p as W,q as u,B as o,T as l,f as T,b as m,aj as y,s as B,P as D,G as f,D as I,w as k,t as g,a6 as A,m as M,a7 as j}from"./index-DytCFD-4.js";import{Q as N}from"./index-nf7cH2Qy.js";import{P as R}from"./Print-BvyVrtZx.js";const H=b(e.jsx("path",{d:"M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m0 16H8V7h11z"})),$=b(e.jsx("path",{d:"M15 21h-2v-2h2zm-2-7h-2v5h2zm8-2h-2v4h2zm-2-2h-2v2h2zM7 12H5v2h2zm-2-2H3v2h2zm7-5h2V3h-2zm-7.5-.5v3h3v-3zM9 9H3V3h6zm-4.5 7.5v3h3v-3zM9 21H3v-6h6zm7.5-16.5v3h3v-3zM21 9h-6V3h6zm-2 10v-3h-4v2h2v3h4v-2zm-2-7h-4v2h4zm-4-2H7v2h2v2h2v-2h2zm1-1V7h-2V5h-2v4zM6.75 5.25h-1.5v1.5h1.5zm0 12h-1.5v1.5h1.5zm12-12h-1.5v1.5h1.5z"})),O=({value:t,height:r=45})=>{const n=[];let a=!0;for(let s=0;s<t.length;s++){const i=t.charCodeAt(s),c=[i%3+1,(i>>2)%3+1,(i>>4)%2+1];for(const p of c)n.push({width:p,isBlack:a}),a=!a}const d=n.reduce((s,i)=>s+i.width,0);return e.jsxs(o,{sx:{display:"flex",flexDirection:"column",alignItems:"center",my:1},children:[e.jsx("svg",{width:Math.min(d*2.5,300),height:r,viewBox:`0 0 ${d} ${r}`,style:{display:"block"},children:n.map((s,i)=>{if(!s.isBlack)return null;const c=n.slice(0,i).reduce((p,x)=>p+x.width,0);return e.jsx("rect",{x:c,y:0,width:s.width,height:r,fill:"#000000"},i)})}),e.jsxs(l,{variant:"caption",sx:{fontFamily:"monospace",letterSpacing:2,fontWeight:700,color:"#111827",mt:.5,fontSize:"0.75rem"},children:["*",t,"*"]})]})},U=({open:t,onClose:r,type:n,title:a,code:d,qrPayload:s,metadata:i,millName:c="EverGreen One Textiles"})=>{const p=S.useRef(null),x=()=>{if(!p.current)return;const h=window.open("","_blank","width=650,height=750");if(!h){g.error("Pop-up blocked. Please allow pop-ups to print barcode labels.");return}h.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${n} Label - ${d}</title>
          <style>
            @page {
              size: 4in 3in;
              margin: 0.15in;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              color: #111827;
              margin: 0;
              padding: 10px;
              background: #fff;
            }
            .label-card {
              border: 2px solid #000;
              padding: 12px;
              border-radius: 6px;
              box-sizing: border-box;
            }
            .header {
              display: flex;
              justify-content: space-between;
              border-bottom: 2px solid #000;
              padding-bottom: 6px;
              margin-bottom: 8px;
            }
            .title {
              font-size: 16px;
              font-weight: 800;
              text-transform: uppercase;
            }
            .code {
              font-size: 18px;
              font-weight: 900;
              font-family: monospace;
              letter-spacing: 1px;
            }
            .content {
              display: flex;
              gap: 12px;
              align-items: center;
            }
            .meta-table {
              width: 100%;
              font-size: 12px;
              border-collapse: collapse;
            }
            .meta-table td {
              padding: 3px 0;
            }
            .meta-label {
              font-weight: bold;
              color: #4b5563;
              width: 40%;
            }
            .barcode-footer {
              text-align: center;
              margin-top: 8px;
              border-top: 1px dashed #666;
              padding-top: 6px;
            }
          </style>
        </head>
        <body>
          ${p.current.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          <\/script>
        </body>
      </html>
    `),h.document.close()},w=()=>{navigator.clipboard.writeText(s),g.success("✓ Traceability payload copied to clipboard")},z={BATCH:"primary",BAG:"success",OUTWARD:"warning"};return e.jsxs(W,{open:t,onClose:r,maxWidth:"sm",fullWidth:!0,children:[e.jsxs(u,{sx:{display:"flex",alignItems:"center",justifyContent:"space-between",pb:1},children:[e.jsxs(o,{sx:{display:"flex",alignItems:"center",gap:1.5},children:[e.jsx($,{color:"primary"}),e.jsx(l,{variant:"h6",fontWeight:800,children:a}),e.jsx(T,{label:n,size:"small",color:z[n]||"default",sx:{fontWeight:700}})]}),e.jsx(m,{size:"small",onClick:r,sx:{minWidth:36,p:.5},children:e.jsx(y,{fontSize:"small"})})]}),e.jsx(B,{dividers:!0,sx:{backgroundColor:"background.default"},children:e.jsx(o,{ref:p,children:e.jsxs(D,{elevation:2,className:"label-card",sx:{p:2.5,backgroundColor:"#ffffff",color:"#111827",borderRadius:2,border:"2px solid #111827"},children:[e.jsxs(o,{className:"header",sx:{display:"flex",justifyContent:"space-between",borderBottom:"2px solid #111827",pb:1,mb:1.5},children:[e.jsxs(o,{children:[e.jsx(l,{variant:"subtitle2",sx:{fontWeight:800,textTransform:"uppercase",letterSpacing:.5},children:c}),e.jsx(l,{variant:"caption",sx:{color:"#4b5563"},children:"Industrial Traceability Tag"})]}),e.jsx(l,{variant:"caption",sx:{fontWeight:700,color:"#111827"},children:new Date().toLocaleDateString("en-IN")})]}),e.jsx(o,{sx:{mb:1.5,textAlign:"center",backgroundColor:"#f3f4f6",py:.5,borderRadius:1},children:e.jsx(l,{variant:"body1",className:"code",sx:{fontWeight:900,fontFamily:"monospace",letterSpacing:1.5,color:"#111827"},children:d})}),e.jsxs(f,{container:!0,spacing:2,alignItems:"center",className:"content",children:[e.jsx(f,{size:{xs:5},sx:{display:"flex",justifyContent:"center"},children:e.jsx(o,{sx:{p:1,backgroundColor:"#ffffff",border:"1px solid #e5e7eb",borderRadius:1.5,display:"inline-flex"},children:e.jsx(N,{value:s,size:120,level:"M",includeMargin:!1})})}),e.jsx(f,{size:{xs:7},children:e.jsx("table",{className:"meta-table",style:{width:"100%",borderCollapse:"collapse",fontSize:"0.85rem"},children:e.jsx("tbody",{children:i.map((h,C)=>e.jsxs("tr",{style:{borderBottom:"1px solid #f3f4f6"},children:[e.jsxs("td",{style:{fontWeight:700,color:"#4b5563",padding:"3px 0"},className:"meta-label",children:[h.label,":"]}),e.jsx("td",{style:{fontWeight:800,color:"#111827",textAlign:"right",padding:"3px 0"},children:h.value})]},C))})})})]}),e.jsx(I,{sx:{my:1.5,borderColor:"#d1d5db"}}),e.jsx(o,{className:"barcode-footer",children:e.jsx(O,{value:d,height:38})})]})})}),e.jsxs(k,{sx:{px:3,py:2,gap:1},children:[e.jsx(m,{startIcon:e.jsx(H,{}),variant:"outlined",size:"small",onClick:w,children:"Copy Payload"}),e.jsx(o,{sx:{flex:1}}),e.jsx(m,{startIcon:e.jsx(R,{}),variant:"contained",color:"primary",onClick:x,children:'Print Label (4"×3")'})]})]})};function P(t,r=3){let n=String(t);for(;n.length<r;)n="0"+n;return n}function v(t){const r=t?new Date(t):new Date,n=r.getFullYear(),a=String(r.getMonth()+1).padStart(2,"0"),d=String(r.getDate()).padStart(2,"0");return`${n}${a}${d}`}function E(t=4){const r="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";let n="";for(let a=0;a<t;a++)n+=r.charAt(Math.floor(Math.random()*r.length));return n}function F(t,r,n=1){const a=v(r);return`BAG-C${String(t).replace(/\D/g,"")||"2"}-${a}-${P(n,3)}`}function L(t,r){const n=v(t),a=r?String(r).padStart(4,"0"):E(4);return`OUT-${n}-${a}`}function J(t){return JSON.stringify({type:"INWARD_BATCH",code:t.batchId,supplier:t.supplier||"N/A",date:t.date?new Date(t.date).toISOString().split("T")[0]:"",bales:t.bale||0,grossKg:t.kg||0,system:"EverGreen One",v:1})}function K(t){return JSON.stringify({type:"OUTWARD_DISPATCH",ref:`OUT-${t.id||"GEN"}`,customer:t.customerName||"N/A",vehicle:t.vehicleNo||"N/A",bags:t.totalBags||0,weightKg:t.totalWeight||0,date:t.date?new Date(t.date).toISOString().split("T")[0]:"",system:"EverGreen One",v:1})}function Y({id:t,stage:r,title:n,description:a,icon:d,onClose:s,busy:i}){return e.jsxs(u,{id:t,sx:{p:{xs:2,sm:3},borderBottom:"1px solid",borderColor:"divider",bgcolor:c=>j(c.palette.primary.main,.06),position:"relative",overflow:"hidden"},children:[e.jsx(o,{"aria-hidden":!0,sx:{position:"absolute",left:0,top:0,bottom:0,width:5,bgcolor:"primary.main"}}),e.jsxs(A,{direction:"row",spacing:2,alignItems:"flex-start",children:[e.jsx(o,{"aria-hidden":!0,sx:{display:{xs:"none",sm:"grid"},placeItems:"center",width:48,height:48,borderRadius:"12px",bgcolor:"primary.main",color:"primary.contrastText",flexShrink:0},children:d}),e.jsxs(o,{sx:{flex:1,minWidth:0},children:[e.jsxs(l,{variant:"overline",color:"primary.main",sx:{lineHeight:1.5},children:["EverGreen / ",r]}),e.jsx(l,{component:"span",variant:"h5",display:"block",sx:{fontWeight:800,mt:.5},children:n}),e.jsx(l,{id:`${t}-description`,variant:"body2",color:"text.secondary",sx:{mt:.75},children:a})]}),e.jsx(M,{onClick:s,disabled:i,"aria-label":"Close dialog",size:"small",children:e.jsx(y,{})})]})]})}function _({title:t,children:r}){return e.jsxs(o,{sx:{mt:3,p:2,border:"1px solid",borderColor:"divider",borderRadius:"12px",bgcolor:n=>j(n.palette.primary.main,.04)},children:[e.jsx(l,{variant:"overline",color:"primary.main",children:t}),e.jsx(o,{sx:{display:"flex",flexWrap:"wrap",gap:3,mt:1},children:r})]})}function Z({label:t,value:r}){return e.jsxs(o,{sx:{minWidth:100,flex:1},children:[e.jsx(l,{variant:"body2",color:"text.secondary",children:t}),e.jsx(l,{variant:"h6",sx:{fontWeight:750,overflowWrap:"anywhere"},children:r})]})}export{U as B,Y as E,$ as Q,Z as S,_ as a,J as b,K as c,L as d,F as f,E as g,P as p};
