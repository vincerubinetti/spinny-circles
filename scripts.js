window.onload = function () {
  Canvas = document.getElementById("main_canvas");
  Brush = Canvas.getContext("2d");

  Canvas.width = 800;
  Canvas.height = 800;

  Brush.setTransform(1, 0, 0, 1, Canvas.width / 2, Canvas.height / 2);

  var controls = document.querySelectorAll("input");
  for (var control of controls) control.oninput = UpdateValues;

  // default values
  Start = 1;
  End = 8;
  Thickness = 10;
  Spacing = 30;
  Spin = 1;
  Power = -0.1;
  Pattern = "-- -- -- ";
  Segments = [];

  UpdateAllControls();
  ParsePattern();

  FPS = 60;
  Time = 0;

  Step();
};

function UpdateValues() {
  var value =
    this.type === "text"
      ? this.value.replace(/[^\-]/gm, " ")
      : Number(this.value);

  if (value === NaN) return;

  if (this.dataset.partner)
    document.getElementById(this.dataset.partner).value = value;

  switch (this.id) {
    case "start":
    case "start_t":
      Start = value;
      break;
    case "end":
    case "end_t":
      End = value;
      break;
    case "thickness":
    case "thickness_t":
      Thickness = value;
      break;
    case "spacing":
    case "spacing_t":
      Spacing = value;
      break;
    case "spin":
    case "spin_t":
      Spin = value;
      break;
    case "power":
    case "power_t":
      Power = value;
      break;
    case "pattern":
      Pattern = value;
      break;
  }

  if (this.id === "pattern") {
    this.value = value;
    ParsePattern();
  }
}

function UpdateAllControls() {
  document.getElementById("start").value = Start;
  document.getElementById("start_t").value = Start;
  document.getElementById("end").value = End;
  document.getElementById("end_t").value = End;
  document.getElementById("thickness").value = Thickness;
  document.getElementById("thickness_t").value = Thickness;
  document.getElementById("spacing").value = Spacing;
  document.getElementById("spacing_t").value = Spacing;
  document.getElementById("spin").value = Spin;
  document.getElementById("spin_t").value = Spin;
  document.getElementById("power").value = Power;
  document.getElementById("power_t").value = Power;
  document.getElementById("pattern").value = Pattern;
}

function ParsePattern() {
  Segments = [];

  // if pattern is empty or all the same character
  if (/^(.)\1+$/.test(Pattern) || Pattern.length <= 1) {
    Segments.push({ start: 0, end: 360 });
    return;
  }

  var prevChar;
  for (var i = 0; i < Pattern.length; i++) {
    var char = Pattern[i];

    if (char === "-" && prevChar !== "-")
      Segments.push({ start: (i / Pattern.length) * 360 });

    if (char !== "-" && prevChar === "-")
      Segments[Segments.length - 1].end = (i / Pattern.length) * 360;

    prevChar = char;
  }
  if (!Segments[Segments.length - 1].end)
    Segments[Segments.length - 1].end = 360;

  // wrap segment to other side to prevent gap
  if (Segments[0].start === 0 && Segments[Segments.length - 1].end === 360) {
    Segments[0].start = Segments[Segments.length - 1].start - 360;
    Segments.pop();
  }
}

function Step() {
  ClearCanvas();

  for (var layer = Start; layer <= End; layer++)
    for (var segment of Segments)
      DrawArc(
        (layer + 0.5) * Spacing,
        Thickness + 1,
        segment.start,
        segment.end,
        Time * Spin * Math.pow(layer + 1, Power)
      );

  Time++;
  window.setTimeout(Step, 1000 / FPS);
}

function DrawArc(radius, thickness, startAngle, endAngle, angleOffset) {
  Brush.beginPath();
  Brush.arc(
    0,
    0,
    radius,
    ((startAngle + angleOffset - 90) / 360) * 2 * Math.PI,
    ((endAngle + angleOffset - 90) / 360) * 2 * Math.PI
  );
  Brush.lineWidth = thickness;
  Brush.stroke();
}

function ClearCanvas() {
  Brush.save();
  Brush.setTransform(1, 0, 0, 1, 0, 0);
  Brush.globalAlpha = 1;
  Brush.fillStyle = "white"; // background color
  Brush.fillRect(0, 0, Canvas.width, Canvas.height);
  Brush.restore();
}
