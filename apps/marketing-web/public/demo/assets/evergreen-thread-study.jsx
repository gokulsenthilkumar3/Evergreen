/* EverGreen Thread Study / Adobe After Effects ExtendScript authoring script.
   Run with File > Scripts > Run Script File in After Effects.
   Creates a composition; it does not submit, save or render anything automatically.
   Preview on the website is a native browser interpretation of the same storyboard. */
(function () {
  app.beginUndoGroup('EverGreen Thread Study');
  try {
    if (!app.project) app.newProject();
    var comp = app.project.items.addComp('EverGreen - One Thread - 8s', 1920, 1080, 1, 8, 60);
    comp.bgColor = [0.027, 0.067, 0.051];
    var ink = [0.027, 0.067, 0.051], copper = [0.83, 0.61, 0.42], ivory = [0.945, 0.929, 0.886];
    comp.layers.addSolid(ink, 'EverGreen / Ground', 1920, 1080, 1, 8);
    function opacity(layer, times, values) { var p = layer.property('ADBE Transform Group').property('ADBE Opacity'); for (var j = 0; j < times.length; j++) p.setValueAtTime(times[j], values[j]); }
    function pathLayer(name, vertices, color, width, closed) {
      var layer = comp.layers.addShape(); layer.name = name;
      var group = layer.property('ADBE Root Vectors Group').addProperty('ADBE Vector Group'); group.name = name;
      var contents = group.property('ADBE Vectors Group');
      var path = contents.addProperty('ADBE Vector Shape - Group'); var shape = new Shape(); shape.vertices = vertices; shape.closed = !!closed;
      shape.inTangents = []; shape.outTangents = [];
      for (var j = 0; j < vertices.length; j++) { shape.inTangents.push([0,0]); shape.outTangents.push([0,0]); }
      path.property('ADBE Vector Shape').setValue(shape);
      var stroke = contents.addProperty('ADBE Vector Graphic - Stroke'); stroke.property('ADBE Vector Stroke Color').setValue(color); stroke.property('ADBE Vector Stroke Width').setValue(width);
      layer.property('ADBE Transform Group').property('ADBE Position').setValue([960,540]);
      return {layer:layer, contents:contents};
    }
    for (var i = 0; i < 8; i++) {
      var fibre = pathLayer('01 / Fibre ' + (i + 1), [[-210+i*60, -240],[-290+i*60,240]], copper, 2, false);
      opacity(fibre.layer,[0,1.3,2.8],[0,60,0]);
      var trim = fibre.contents.addProperty('ADBE Vector Filter - Trim'); trim.property('ADBE Vector Trim End').setValueAtTime(0,0); trim.property('ADBE Vector Trim End').setValueAtTime(1.5,100);
    }
    var cone = pathLayer('02 / Yarn package', [[-75,-210],[75,-210],[155,210],[-155,210]], ivory, 3, true);
    opacity(cone.layer,[1.5,2.4,3.3,4.3],[0,100,100,0]);
    for (var row = 0; row < 16; row++) {
      var line = pathLayer('02 / Winding ' + row,[[-80-row*4,-190+row*25],[80+row*4,-180+row*25]],copper,1,false);
      opacity(line.layer,[1.7,2.6,3.3,4.3],[0,85,85,0]);
    }
    var record = pathLayer('03 / Record', [[-220,-200],[220,-200],[220,200],[-220,200]],copper,2,true);
    opacity(record.layer,[3.2,4.2,5.6,6.4],[0,100,100,0]);
    for (var r = 0; r < 4; r++) { var rule = pathLayer('03 / Record line ' + r,[[-160,-100+r*65],[160,-100+r*65]],ivory,1,false); opacity(rule.layer,[3.6,4.6,5.6,6.4],[0,70,70,0]); }
    var title = comp.layers.addText('One thread.'); title.name='04 / One thread';
    var source = title.property('ADBE Text Properties').property('ADBE Text Document'); var document = source.value; document.fontSize=180; document.fillColor=ivory; document.justification=ParagraphJustification.CENTER_JUSTIFY; source.setValue(document);
    title.property('ADBE Transform Group').property('ADBE Position').setValue([960,590]);opacity(title,[5.7,6.8,8],[0,100,100]);
    var marker = new MarkerValue('Fibre -> yarn -> record -> one thread. Review timing and chosen local fonts before render.'); comp.markerProperty.setValueAtTime(0,marker);
    comp.openInViewer();
    alert('EverGreen composition created. Review fonts, easing and framing, then save/render from After Effects. No project file was saved automatically.');
  } catch (error) { alert('The composition could not be completed: ' + error.toString()); }
  finally { app.endUndoGroup(); }
}());
