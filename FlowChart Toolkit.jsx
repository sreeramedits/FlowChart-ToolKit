(function(thisObj) {
    // ==========================================
    // TOP-LEVEL HELPERS (ES3 Safe)
    // ==========================================
    var rgbToHex = function(rgb) {
        var r = Math.round(rgb[0] * 255).toString(16);
        var g = Math.round(rgb[1] * 255).toString(16);
        var b = Math.round(rgb[2] * 255).toString(16);
        if (r.length < 2) r = "0" + r;
        if (g.length < 2) g = "0" + g;
        if (b.length < 2) b = "0" + b;
        return (r + g + b).toUpperCase();
    };

    var hexToRgb = function(hexStr) {
        if (!hexStr) return null;
        var clean = ("" + hexStr).replace(/[^0-9A-Fa-f]/g, "");
        if (clean.length === 3) {
            clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
        }
        if (clean.length !== 6) return null;
        var val = parseInt(clean, 16);
        return [
            ((val >> 16) & 255) / 255,
            ((val >> 8) & 255) / 255,
            (val & 255) / 255,
            1
        ];
    };

    // Custom Non-Freezing Color Dialog
    var openColorPalette = function(currentHex, onColorSelected) {
        var dlg = new Window("dialog", "Color Palette");
        dlg.orientation = "column";
        dlg.alignChildren = ["fill", "top"];
        dlg.spacing = 10;
        dlg.margins = 14;

        var curRGB = hexToRgb(currentHex) || [1, 1, 1, 1];

        // 12 Curated Flowchart Swatches
        var swatchPanel = dlg.add("panel", undefined, "Quick Swatches");
        swatchPanel.orientation = "column";
        swatchPanel.alignChildren = ["fill", "center"];
        swatchPanel.spacing = 5;
        swatchPanel.margins = 10;

        var swatches = [
            ["#FFFFFF", "#B0B0B0", "#333333", "#1E222A"],
            ["#FF5C5C", "#FFA834", "#FFD834", "#34D399"],
            ["#38BDF8", "#3B82F6", "#6366F1", "#A855F7"]
        ];

        var hexField = null;
        var rField = null;
        var gField = null;
        var bField = null;

        var updateAllFields = function(rgb) {
            curRGB = rgb;
            if (hexField) hexField.text = "#" + rgbToHex(rgb);
            if (rField) rField.text = Math.round(rgb[0] * 255).toString();
            if (gField) gField.text = Math.round(rgb[1] * 255).toString();
            if (bField) bField.text = Math.round(rgb[2] * 255).toString();
        };

        for (var rowIdx = 0; rowIdx < swatches.length; rowIdx++) {
            var rowGrp = swatchPanel.add("group");
            rowGrp.orientation = "horizontal";
            rowGrp.spacing = 4;
            rowGrp.alignChildren = ["fill", "center"];
            for (var colIdx = 0; colIdx < swatches[rowIdx].length; colIdx++) {
                var sBtn = rowGrp.add("button", undefined, swatches[rowIdx][colIdx]);
                sBtn.preferredSize.width = 66;
                sBtn.preferredSize.height = 24;
                sBtn.hexVal = swatches[rowIdx][colIdx];
                sBtn.onClick = function() {
                    var p = hexToRgb(this.hexVal);
                    if (p) updateAllFields(p);
                };
            }
        }

        // Custom Hex & RGB Panel
        var customPanel = dlg.add("panel", undefined, "Custom Value");
        customPanel.orientation = "column";
        customPanel.alignChildren = ["left", "top"];
        customPanel.spacing = 6;
        customPanel.margins = 10;

        var hexRow = customPanel.add("group");
        hexRow.orientation = "horizontal";
        hexRow.add("statictext", undefined, "Hex:").characters = 5;
        var initHexFormatted = (currentHex && currentHex.indexOf("#") === 0) ? currentHex : ("#" + currentHex);
        hexField = hexRow.add("edittext", undefined, initHexFormatted);
        hexField.characters = 9;

        hexField.onChange = function() {
            var p = hexToRgb(this.text);
            if (p) {
                curRGB = p;
                if (rField) rField.text = Math.round(p[0] * 255).toString();
                if (gField) gField.text = Math.round(p[1] * 255).toString();
                if (bField) bField.text = Math.round(p[2] * 255).toString();
            }
        };

        var rgbRow = customPanel.add("group");
        rgbRow.orientation = "horizontal";
        rgbRow.spacing = 4;

        rgbRow.add("statictext", undefined, "R:");
        rField = rgbRow.add("edittext", undefined, Math.round(curRGB[0] * 255).toString());
        rField.characters = 3;

        rgbRow.add("statictext", undefined, "G:");
        gField = rgbRow.add("edittext", undefined, Math.round(curRGB[1] * 255).toString());
        gField.characters = 3;

        rgbRow.add("statictext", undefined, "B:");
        bField = rgbRow.add("edittext", undefined, Math.round(curRGB[2] * 255).toString());
        bField.characters = 3;

        var onRgbChange = function() {
            var rv = Math.min(255, Math.max(0, parseInt(rField.text, 10) || 0)) / 255;
            var gv = Math.min(255, Math.max(0, parseInt(gField.text, 10) || 0)) / 255;
            var bv = Math.min(255, Math.max(0, parseInt(bField.text, 10) || 0)) / 255;
            curRGB = [rv, gv, bv, 1];
            if (hexField) hexField.text = "#" + rgbToHex(curRGB);
        };

        rField.onChange = onRgbChange;
        gField.onChange = onRgbChange;
        bField.onChange = onRgbChange;

        // Optional OS Picker fallback
        var osPickerBtn = customPanel.add("button", undefined, "macOS System Picker...");
        osPickerBtn.preferredSize.height = 22;
        osPickerBtn.onClick = function() {
            var initialInt = (Math.round(curRGB[0] * 255) << 16) + (Math.round(curRGB[1] * 255) << 8) + Math.round(curRGB[2] * 255);
            var hexPicked = $.colorPicker(initialInt);
            if (hexPicked !== -1) {
                var rP = ((hexPicked >> 16) & 255) / 255;
                var gP = ((hexPicked >> 8) & 255) / 255;
                var bP = (hexPicked & 255) / 255;
                updateAllFields([rP, gP, bP, 1]);
            }
        };

        // Buttons
        var btnRow = dlg.add("group");
        btnRow.orientation = "horizontal";
        btnRow.alignment = "right";
        btnRow.add("button", undefined, "Apply", {name: "ok"});
        btnRow.add("button", undefined, "Cancel", {name: "cancel"});

        if (dlg.show() === 1) {
            var finalColor = hexToRgb(hexField.text) || curRGB;
            onColorSelected("#" + rgbToHex(finalColor));
        }
    };

    // ==========================================
    // UI BUILDER
    // ==========================================
    function buildUI(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Flowchart Toolkit", undefined, {resizeable: true});
        win.orientation = "column";
        win.alignChildren = ["fill", "top"];
        win.spacing = 10;
        win.margins = 12;
        
        var panelWidth = 190;
        var controlWidth = 160;

        var tpanel = win.add("tabbedpanel");
        tpanel.preferredSize.width = panelWidth + 20;

        // ------------------------------------------
        // TAB 1: LINES
        // ------------------------------------------
        var tabLines = tpanel.add("tab", undefined, "Lines");
        tabLines.orientation = "column";
        tabLines.alignChildren = ["fill", "top"];
        tabLines.spacing = 10;
        tabLines.margins = 8;

        var presetPanel = tabLines.add("panel", undefined, "Path Preset");
        presetPanel.orientation = "column";
        presetPanel.alignChildren = ["left", "top"];
        presetPanel.spacing = 10;
        presetPanel.margins = 14;
        presetPanel.preferredSize.width = panelWidth;

        var presetGrp = presetPanel.add("group");
        presetGrp.orientation = "column";
        presetGrp.alignChildren = ["left", "top"];
        presetGrp.spacing = 2;
        presetGrp.add("statictext", undefined, "Preset Type:");
        var presetDropdown = presetGrp.add("dropdownlist", undefined, [
            "Horizontal Line",
            "Simple Curve",
            "S-Curve",
            "Right Angle Corner",
            "U-Shape / Arc",
            "Branching Split"
        ]);
        presetDropdown.selection = 0;
        presetDropdown.preferredSize.width = controlWidth;

        var branchesGrp = presetPanel.add("group");
        branchesGrp.orientation = "column";
        branchesGrp.alignChildren = ["left", "top"];
        branchesGrp.spacing = 2;
        branchesGrp.visible = false;
        branchesGrp.add("statictext", undefined, "Branches:");
        var branchesDropdown = branchesGrp.add("dropdownlist", undefined, ["1", "2", "3", "4", "5", "6"]);
        branchesDropdown.selection = 1;
        branchesDropdown.preferredSize.width = controlWidth;

        presetDropdown.onChange = function() {
            var isBranching = (presetDropdown.selection !== null && presetDropdown.selection.text === "Branching Split");
            branchesGrp.visible = isBranching;
            win.layout.layout(true);
        };

        var capPanel = tabLines.add("panel", undefined, "Cap Shapes");
        capPanel.orientation = "column";
        capPanel.alignChildren = ["left", "top"];
        capPanel.spacing = 10;
        capPanel.margins = 14;
        capPanel.preferredSize.width = panelWidth;

        var startGrp = capPanel.add("group");
        startGrp.orientation = "column";
        startGrp.alignChildren = ["left", "top"];
        startGrp.spacing = 2;
        startGrp.add("statictext", undefined, "Start Cap:");
        var startCapDropdown = startGrp.add("dropdownlist", undefined, ["None", "Arrow", "Dot", "Diamond"]);
        startCapDropdown.selection = 1;
        startCapDropdown.preferredSize.width = controlWidth;

        var endGrp = capPanel.add("group");
        endGrp.orientation = "column";
        endGrp.alignChildren = ["left", "top"];
        endGrp.spacing = 2;
        endGrp.add("statictext", undefined, "End Cap:");
        var endCapDropdown = endGrp.add("dropdownlist", undefined, ["None", "Arrow", "Dot", "Diamond"]);
        endCapDropdown.selection = 1;
        endCapDropdown.preferredSize.width = controlWidth;

        var settingsPanel = tabLines.add("panel", undefined, "Dimensions");
        settingsPanel.orientation = "column";
        settingsPanel.alignChildren = ["left", "top"];
        settingsPanel.spacing = 10;
        settingsPanel.margins = 14;
        settingsPanel.preferredSize.width = panelWidth;

        var strokeGrp = settingsPanel.add("group");
        strokeGrp.orientation = "column";
        strokeGrp.alignChildren = ["left", "top"];
        strokeGrp.spacing = 2;
        strokeGrp.add("statictext", undefined, "Stroke Width (px):");
        var strokeWidthInput = strokeGrp.add("edittext", undefined, "10");
        strokeWidthInput.preferredSize.width = controlWidth;

        var sizeGrp = settingsPanel.add("group");
        sizeGrp.orientation = "column";
        sizeGrp.alignChildren = ["left", "top"];
        sizeGrp.spacing = 2;
        sizeGrp.add("statictext", undefined, "Cap Scale (%):");
        var capSizeInput = sizeGrp.add("edittext", undefined, "100");
        capSizeInput.preferredSize.width = controlWidth;

        var colorPanel = tabLines.add("panel", undefined, "Line Color");
        colorPanel.orientation = "column";
        colorPanel.alignChildren = ["left", "top"];
        colorPanel.spacing = 6;
        colorPanel.margins = 14;
        colorPanel.preferredSize.width = panelWidth;

        var colorRow = colorPanel.add("group");
        colorRow.orientation = "horizontal";
        colorRow.spacing = 6;

        var colorHexInput = colorRow.add("edittext", undefined, "#FFFFFF");
        colorHexInput.preferredSize.width = 80;

        var colorPickBtn = colorRow.add("button", undefined, "Palette");
        colorPickBtn.preferredSize.width = 74;
        colorPickBtn.preferredSize.height = 24;

        colorPickBtn.onClick = function() {
            openColorPalette(colorHexInput.text, function(selectedHex) {
                colorHexInput.text = selectedHex;
            });
        };

        var createBtn = tabLines.add("button", undefined, "Create Cap Line");
        createBtn.preferredSize.height = 32;
        createBtn.preferredSize.width = panelWidth;

        // ------------------------------------------
        // TAB 2: NODES
        // ------------------------------------------
        var tabNodes = tpanel.add("tab", undefined, "Nodes");
        tabNodes.orientation = "column";
        tabNodes.alignChildren = ["fill", "top"];
        tabNodes.spacing = 10;
        tabNodes.margins = 8;

        var nodePresetPanel = tabNodes.add("panel", undefined, "Shape Type");
        nodePresetPanel.orientation = "column";
        nodePresetPanel.alignChildren = ["left", "top"];
        nodePresetPanel.spacing = 10;
        nodePresetPanel.margins = 14;
        nodePresetPanel.preferredSize.width = panelWidth;

        var nodeDropdownGrp = nodePresetPanel.add("group");
        nodeDropdownGrp.orientation = "column";
        nodeDropdownGrp.alignChildren = ["left", "top"];
        nodeDropdownGrp.spacing = 2;
        nodeDropdownGrp.add("statictext", undefined, "Choose Shape:");
        var nodeDropdown = nodeDropdownGrp.add("dropdownlist", undefined, ["Rounded Rectangle", "Ellipse", "Diamond"]);
        nodeDropdown.selection = 0;
        nodeDropdown.preferredSize.width = controlWidth;

        var nodeStylePanel = tabNodes.add("panel", undefined, "Colors");
        nodeStylePanel.orientation = "column";
        nodeStylePanel.alignChildren = ["left", "top"];
        nodeStylePanel.spacing = 8;
        nodeStylePanel.margins = 14;
        nodeStylePanel.preferredSize.width = panelWidth;

        nodeStylePanel.add("statictext", undefined, "Outline Color:");
        var nodeOutlineRow = nodeStylePanel.add("group");
        nodeOutlineRow.orientation = "horizontal";
        nodeOutlineRow.spacing = 6;
        var nodeOutlineHexInput = nodeOutlineRow.add("edittext", undefined, "#FFFFFF");
        nodeOutlineHexInput.preferredSize.width = 80;
        var nodeOutlinePickBtn = nodeOutlineRow.add("button", undefined, "Palette");
        nodeOutlinePickBtn.preferredSize.width = 74;
        nodeOutlinePickBtn.preferredSize.height = 24;

        nodeOutlinePickBtn.onClick = function() {
            openColorPalette(nodeOutlineHexInput.text, function(selectedHex) {
                nodeOutlineHexInput.text = selectedHex;
            });
        };

        nodeStylePanel.add("statictext", undefined, "Fill Color:");
        var nodeFillRow = nodeStylePanel.add("group");
        nodeFillRow.orientation = "horizontal";
        nodeFillRow.spacing = 6;
        var nodeFillHexInput = nodeFillRow.add("edittext", undefined, "#333333");
        nodeFillHexInput.preferredSize.width = 80;
        var nodeFillPickBtn = nodeFillRow.add("button", undefined, "Palette");
        nodeFillPickBtn.preferredSize.width = 74;
        nodeFillPickBtn.preferredSize.height = 24;

        nodeFillPickBtn.onClick = function() {
            openColorPalette(nodeFillHexInput.text, function(selectedHex) {
                nodeFillHexInput.text = selectedHex;
            });
        };

        var createNodeBtn = tabNodes.add("button", undefined, "Create Node Shape");
        createNodeBtn.preferredSize.height = 32;
        createNodeBtn.preferredSize.width = panelWidth;

        // ==========================================
        // CREATE LINE HANDLER
        // ==========================================
        createBtn.onClick = function() {
            var comp = app.project.activeItem;
            if (!(comp instanceof CompItem)) {
                alert("Please select or open a Composition first.");
                return;
            }

            var presetType = (presetDropdown.selection !== null) ? presetDropdown.selection.text : "Horizontal Line";
            var startType = (startCapDropdown.selection !== null) ? startCapDropdown.selection.text : "None";
            var endType = (endCapDropdown.selection !== null) ? endCapDropdown.selection.text : "None";

            var strokeWidth = parseFloat(strokeWidthInput.text);
            if (isNaN(strokeWidth) || strokeWidth <= 0) {
                alert("Please enter a valid positive number for Stroke Width.");
                return;
            }

            var capSize = parseFloat(capSizeInput.text);
            if (isNaN(capSize) || capSize <= 0) {
                alert("Please enter a valid positive number for Cap Size.");
                return;
            }

            var selectedColorRGB = hexToRgb(colorHexInput.text) || [1, 1, 1, 1];

            app.beginUndoGroup("Create Cap Line");

            try {
                var shapeLayer = comp.layers.addShape();
                shapeLayer.name = (presetType === "Branching Split") ? "Branching Split Line" : "Line with Caps";

                var contents = shapeLayer.property("ADBE Root Vectors Group") || shapeLayer.property("Contents") || shapeLayer.content;
                if (!contents) throw new Error("Could not find Shape Contents group.");

                // 1. ADD PATHS FIRST
                if (presetType === "Branching Split") {
                    var numBranches = parseInt(branchesDropdown.selection.text, 10);
                    if (isNaN(numBranches)) numBranches = 2;

                    var trunkGroup = contents.addProperty("ADBE Vector Shape - Group");
                    trunkGroup.name = "Trunk Path";
                    var trunkProp = trunkGroup.property("ADBE Vector Shape") || trunkGroup.property("Path 1") || trunkGroup.property("Path");
                    var trunkShape = new Shape();
                    trunkShape.vertices = [[0, -150], [0, -50]];
                    trunkShape.inTangents = [[0,0], [0,0]];
                    trunkShape.outTangents = [[0,0], [0,0]];
                    trunkShape.closed = false;
                    trunkProp.setValue(trunkShape);

                    var spacing;
                    if (numBranches === 1) spacing = 0;
                    else if (numBranches === 2) spacing = 200;
                    else if (numBranches === 3) spacing = 150;
                    else if (numBranches === 4) spacing = 120;
                    else if (numBranches === 5) spacing = 100;
                    else spacing = 90;

                    var startX = -((numBranches - 1) * spacing) / 2;

                    for (var i = 0; i < numBranches; i++) {
                        var x = startX + i * spacing;
                        var branchIndex = i + 1;

                        var branchGroup = contents.addProperty("ADBE Vector Shape - Group");
                        branchGroup.name = "Branch Path " + branchIndex;
                        var branchProp = branchGroup.property("ADBE Vector Shape") || branchGroup.property("Path 1") || branchGroup.property("Path");
                        
                        var branchShape = new Shape();
                        branchShape.vertices = [[0, -50], [x, 100]];
                        
                        var curveForce = Math.abs(x) * 0.4;
                        branchShape.inTangents = [[0, 0], [0, -curveForce]];
                        branchShape.outTangents = [[0, curveForce], [0, 0]];
                        branchShape.closed = false;
                        branchProp.setValue(branchShape);
                    }

                } else {
                    var pathGroup = contents.addProperty("ADBE Vector Shape - Group");
                    pathGroup.name = "Path 1";
                    var pathProp = pathGroup.property("ADBE Vector Shape") || pathGroup.property("Path 1") || pathGroup.property("Path");
                    
                    var pathData = new Shape();
                    switch (presetType) {
                        case "Horizontal Line":
                            pathData.vertices = [[-200, 0], [200, 0]];
                            pathData.inTangents = [[0,0], [0,0]];
                            pathData.outTangents = [[0,0], [0,0]];
                            break;
                        case "Simple Curve":
                            pathData.vertices = [[-200, 50], [0, -100], [200, 50]];
                            pathData.inTangents = [[0,0], [-100, 0], [0,0]];
                            pathData.outTangents = [[0,0], [100, 0], [0,0]];
                            break;
                        case "S-Curve":
                            pathData.vertices = [[-200, 100], [200, -100]];
                            pathData.inTangents = [[0, 0], [-150, 0]];
                            pathData.outTangents = [[150, 0], [0, 0]];
                            break;
                        case "Right Angle Corner":
                            pathData.vertices = [[-200, -100], [-200, 100], [200, 100]];
                            pathData.inTangents = [[0,0], [0,0], [0,0]];
                            pathData.outTangents = [[0,0], [0,0], [0,0]];
                            break;
                        case "U-Shape / Arc":
                            pathData.vertices = [[-150, -100], [0, 100], [150, -100]];
                            pathData.inTangents = [[0,0], [-80, 0], [0,0]];
                            pathData.outTangents = [[0,0], [80, 0], [0,0]];
                            break;
                    }
                    pathData.closed = false;
                    pathProp.setValue(pathData);
                }

                // 2. ADD STROKE
                var stroke = contents.addProperty("ADBE Vector Graphic - Stroke");
                stroke.name = "Stroke 1";
                var strokeColor = stroke.property("ADBE Vector Stroke Color") || stroke.property("Color");
                var strokeWidthProp = stroke.property("ADBE Vector Stroke Width") || stroke.property("Stroke Width");
                var strokeLineCap = stroke.property("ADBE Vector Stroke Line Cap") || stroke.property("Line Cap");
                if (strokeColor) strokeColor.setValue(selectedColorRGB);
                if (strokeWidthProp) strokeWidthProp.setValue(strokeWidth);
                if (strokeLineCap) strokeLineCap.setValue(1);

                // 3. SLIDERS (ES3 Function Expression)
                var effects = shapeLayer.property("ADBE Effect Parade") || shapeLayer.property("Effects") || shapeLayer.Effects;
                
                var addSlider = function(name, val) {
                    if (effects) {
                        var slider = effects.addProperty("ADBE Slider Control");
                        slider.name = name;
                        var sliderVal = slider.property(1) || slider.property("Slider");
                        if (sliderVal) sliderVal.setValue(val);
                    }
                };

                if (presetType === "Branching Split") {
                    addSlider("Start Cap Size", capSize);
                    addSlider("Split Cap Size", capSize);
                    addSlider("End Cap Size", capSize);
                } else {
                    if (startType !== "None") addSlider("Start Cap Size", capSize);
                    if (endType !== "None") addSlider("End Cap Size", capSize);
                }

                // 4. CAPS BUILDER (ES3 Function Expression)
                var addCap = function(groupName, capType, pathName, isStart, customSliderName) {
                    if (capType === "None") return;

                    var capGroup = contents.addProperty("ADBE Vector Group");
                    capGroup.name = groupName;
                    var capContents = capGroup.property("ADBE Vectors Group") || capGroup.property("Contents") || capGroup.content;
                    if (!capContents) return;

                    if (capType === "Arrow") {
                        var arrowPathGroup = capContents.addProperty("ADBE Vector Shape - Group");
                        arrowPathGroup.name = "Arrow Path";
                        var arrowPathProp = arrowPathGroup.property("ADBE Vector Shape") || arrowPathGroup.property("Path 1") || arrowPathGroup.property("Path");
                        if (arrowPathProp) {
                            var arrowShape = new Shape();
                            arrowShape.vertices = [[20, 0], [-10, -15], [0, 0], [-10, 15]];
                            arrowShape.inTangents = [[0,0], [0,0], [0,0], [0,0]];
                            arrowShape.outTangents = [[0,0], [0,0], [0,0], [0,0]];
                            arrowShape.closed = true;
                            arrowPathProp.setValue(arrowShape);
                        }
                    } else if (capType === "Dot") {
                        var dotShape = capContents.addProperty("ADBE Vector Shape - Ellipse");
                        dotShape.name = "Dot Shape";
                        var dotSize = dotShape.property("ADBE Vector Ellipse Size") || dotShape.property("Size");
                        if (dotSize) dotSize.setValue([30, 30]);
                    } else if (capType === "Diamond") {
                        var diamondPathGroup = capContents.addProperty("ADBE Vector Shape - Group");
                        diamondPathGroup.name = "Diamond Path";
                        var diamondPathProp = diamondPathGroup.property("ADBE Vector Shape") || diamondPathGroup.property("Path 1") || diamondPathGroup.property("Path");
                        if (diamondPathProp) {
                            var diamondShape = new Shape();
                            diamondShape.vertices = [[0, -15], [15, 0], [0, 15], [-15, 0]];
                            diamondShape.inTangents = [[0,0], [0,0], [0,0], [0,0]];
                            diamondShape.outTangents = [[0,0], [0,0], [0,0], [0,0]];
                            diamondShape.closed = true;
                            diamondPathProp.setValue(diamondShape);
                        }
                    }

                    var fill = capContents.addProperty("ADBE Vector Graphic - Fill");
                    fill.name = "Cap Fill";
                    var fillColor = fill.property("ADBE Vector Fill Color") || fill.property("Color");
                    if (fillColor) {
                        fillColor.expression = 'thisLayer.content("Stroke 1")("ADBE Vector Stroke Color")';
                    }

                    var capTransform = capGroup.property("ADBE Vector Transform Group") || capGroup.property("Transform");
                    if (!capTransform) return;
                    var capAnchor = capTransform.property("ADBE Vector Anchor Point") || capTransform.property("Anchor Point");
                    var capPos = capTransform.property("ADBE Vector Position") || capTransform.property("Position");
                    var capRot = capTransform.property("ADBE Vector Rotation") || capTransform.property("Rotation");
                    var capScale = capTransform.property("ADBE Vector Scale") || capTransform.property("Scale");

                    if (capAnchor) capAnchor.setValue([0, 0]);

                    var pct = isStart ? "0" : "1";
                    var posExpr = 
                        'var p = thisLayer.content("' + pathName + '")("ADBE Vector Shape");\n' +
                        'var pct = ' + pct + ';\n' +
                        'try {\n' +
                        '    var trim = thisLayer.content("Trim Paths 1");\n' +
                        '    if (trim.active) pct = (trim.' + (isStart ? 'start' : 'end') + ' / 100);\n' +
                        '} catch(err) {}\n' +
                        'p.pointOnPath(pct);';
                    if (capPos) capPos.expression = posExpr;

                    if ((capType === "Arrow" || capType === "Diamond") && capRot) {
                        var rotExpr = 
                            'var p = thisLayer.content("' + pathName + '")("ADBE Vector Shape");\n' +
                            'var pct = ' + pct + ';\n' +
                            'try {\n' +
                            '    var trim = thisLayer.content("Trim Paths 1");\n' +
                            '    if (trim.active) pct = (trim.' + (isStart ? 'start' : 'end') + ' / 100);\n' +
                            '} catch(err) {}\n' +
                            'var t = p.tangentOnPath(pct);\n' +
                            'var angle = Math.atan2(t[1], t[0]);\n' +
                            'radiansToDegrees(angle)' + (isStart ? ' + 180' : '') + ';';
                        capRot.expression = rotExpr;
                    }

                    var sliderName = customSliderName || (isStart ? "Start Cap Size" : "End Cap Size");
                    var scaleExpr = 
                        'var sz = thisLayer.effect("' + sliderName + '")(1);\n' +
                        '[sz, sz];';
                    if (capScale) capScale.expression = scaleExpr;
                };

                // Add Caps
                if (presetType === "Branching Split") {
                    addCap("Start Cap", startType, "Trunk Path", true, "Start Cap Size");
                    addCap("Split Cap", "Diamond", "Trunk Path", false, "Split Cap Size");
                    for (var bIdx = 0; bIdx < numBranches; bIdx++) {
                        var bNum = bIdx + 1;
                        addCap("End Cap " + bNum, endType, "Branch Path " + bNum, false, "End Cap Size");
                    }
                } else {
                    addCap("Start Cap", startType, "Path 1", true, "Start Cap Size");
                    addCap("End Cap", endType, "Path 1", false, "End Cap Size");
                }

                for (var lIdx = 1; lIdx <= comp.layers.length; lIdx++) {
                    comp.layers[lIdx].selected = false;
                }
                shapeLayer.selected = true;

            } catch (err) {
                alert("An error occurred: " + err.message);
            } finally {
                app.endUndoGroup();
            }
        };

        // ==========================================
        // CREATE NODE SHAPE HANDLER
        // ==========================================
        createNodeBtn.onClick = function() {
            var comp = app.project.activeItem;
            if (!(comp instanceof CompItem)) {
                alert("Please select or open a Composition first.");
                return;
            }

            var nodeType = (nodeDropdown.selection !== null) ? nodeDropdown.selection.text : "Rounded Rectangle";

            var selectedOutlineColor = hexToRgb(nodeOutlineHexInput.text) || [1, 1, 1, 1];
            var selectedFillColor = hexToRgb(nodeFillHexInput.text) || [0.2, 0.2, 0.2, 1];

            app.beginUndoGroup("Create Node Shape");

            try {
                var shapeLayer = comp.layers.addShape();
                shapeLayer.name = "Node - " + nodeType;

                var effects = shapeLayer.property("ADBE Effect Parade") || shapeLayer.property("Effects") || shapeLayer.Effects;
                if (!effects) throw new Error("Could not find Effects parade.");

                var addSlider = function(name, val) {
                    var s = effects.addProperty("ADBE Slider Control");
                    s.name = name;
                    var v = s.property(1) || s.property("Slider");
                    if (v) v.setValue(val);
                };

                var addColor = function(name, val) {
                    var c = effects.addProperty("ADBE Color Control");
                    c.name = name;
                    var v = c.property(1) || c.property("Color");
                    if (v) v.setValue(val);
                };

                var isRect = (nodeType === "Rounded Rectangle");
                var isDiamond = (nodeType === "Diamond");

                if (isRect) {
                    addSlider("Size X", 300);
                    addSlider("Size Y", 100);
                    addSlider("Corner Radius", 15);
                } else if (isDiamond) {
                    addSlider("Size", 150);
                    addSlider("Corner Radius", 15);
                } else {
                    addSlider("Size", 150);
                }

                addSlider("Stroke Width", 4);
                addColor("Stroke Color", selectedOutlineColor);
                addSlider("Fill Opacity", 20);
                addColor("Fill Color", selectedFillColor);

                var contents = shapeLayer.property("ADBE Root Vectors Group") || shapeLayer.property("Contents") || shapeLayer.content;
                if (!contents) throw new Error("Could not find Shape Contents group.");

                var group = contents.addProperty("ADBE Vector Group");
                group.name = nodeType;
                var groupContents = group.property("ADBE Vectors Group") || group.property("Contents") || group.content;

                // 1. SHAPE PATH
                if (nodeType === "Rounded Rectangle" || nodeType === "Diamond") {
                    var rectShape = groupContents.addProperty("ADBE Vector Shape - Rect");
                    rectShape.name = "Rectangle Path";
                    
                    var sizeProp = rectShape.property("ADBE Vector Rect Size") || rectShape.property("Size");
                    var roundProp = rectShape.property("ADBE Vector Rect Roundness") || rectShape.property("Roundness");
                    
                    if (isRect) {
                        if (sizeProp) sizeProp.expression = "[thisLayer.effect('Size X')(1), thisLayer.effect('Size Y')(1)];";
                    } else {
                        if (sizeProp) sizeProp.expression = "[thisLayer.effect('Size')(1), thisLayer.effect('Size')(1)];";
                    }
                    if (roundProp) roundProp.expression = "thisLayer.effect('Corner Radius')(1);";

                    if (nodeType === "Diamond") {
                        var groupTransform = group.property("ADBE Vector Transform Group") || group.property("Transform");
                        if (groupTransform) {
                            var rotProp = groupTransform.property("ADBE Vector Rotation") || groupTransform.property("Rotation");
                            if (rotProp) rotProp.setValue(45);
                        }
                    }
                } else if (nodeType === "Ellipse") {
                    var ellipseShape = groupContents.addProperty("ADBE Vector Shape - Ellipse");
                    ellipseShape.name = "Ellipse Path";
                    
                    var sizeProp = ellipseShape.property("ADBE Vector Ellipse Size") || ellipseShape.property("Size");
                    if (sizeProp) sizeProp.expression = "[thisLayer.effect('Size')(1), thisLayer.effect('Size')(1)];";
                }

                // 2. CREATE STROKE FIRST (Higher in the timeline stack -> Sits ON TOP of the Fill)
                var stroke = groupContents.addProperty("ADBE Vector Graphic - Stroke");
                stroke.name = "Stroke 1";
                var strokeColorProp = stroke.property("ADBE Vector Stroke Color") || stroke.property("Color");
                var strokeWidthProp = stroke.property("ADBE Vector Stroke Width") || stroke.property("Stroke Width");
                if (strokeColorProp) strokeColorProp.expression = "thisLayer.effect('Stroke Color')(1);";
                if (strokeWidthProp) strokeWidthProp.expression = "thisLayer.effect('Stroke Width')(1);";

                // 3. CREATE FILL SECOND (Lower in the timeline stack -> Sits UNDER the Stroke)
                var fill = groupContents.addProperty("ADBE Vector Graphic - Fill");
                fill.name = "Fill 1";
                var fillColorProp = fill.property("ADBE Vector Fill Color") || fill.property("Color");
                var fillOpacityProp = fill.property("ADBE Vector Fill Opacity") || fill.property("Opacity");
                if (fillColorProp) fillColorProp.expression = "thisLayer.effect('Fill Color')(1);";
                if (fillOpacityProp) fillOpacityProp.expression = "thisLayer.effect('Fill Opacity')(1);";

                for (var lIdx2 = 1; lIdx2 <= comp.layers.length; lIdx2++) {
                    comp.layers[lIdx2].selected = false;
                }
                shapeLayer.selected = true;

            } catch (err) {
                alert("An error occurred: " + err.message);
            } finally {
                app.endUndoGroup();
            }
        };

        win.layout.layout(true);
        return win;
    }

    var mainPanel = buildUI(thisObj);
    if (mainPanel instanceof Window) {
        mainPanel.center();
        mainPanel.show();
    }
})(this);
