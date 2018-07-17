function toggle_visibility(id) {
//  alert(id)
    var ele = document.getElementById(id);
    var txt = document.getElementById(id+"_button");
//  alert(ele.style.display)
    if(ele.style.display == "block") {
        ele.style.display = "none";
//        txt.innerHTML = "+  "+id;
    }
    else {
        ele.style.display = "block";
//        txt.innerHTML = "-  "+id;

    }
}


diffview = {
    /**
     * Builds and returns a visual diff view.  The single parameter, `params', should contain
     * the following values:
     *
     * - baseTextLines: the array of strings that was used as the base text input to SequenceMatcher
     * - newTextLines: the array of strings that was used as the new text input to SequenceMatcher
     * - opcodes: the array of arrays returned by SequenceMatcher.get_opcodes()
     * - baseTextName: the title to be displayed above the base text listing in the diff view; defaults
     *   to "Base Text"
     * - newTextName: the title to be displayed above the new text listing in the diff view; defaults
     *   to "New Text"
     * - contextSize: the number of lines of context to show around differences; by default, all lines
     *   are shown
     * - viewType: if 0, a side-by-side diff view is generated (default); if 1, an inline diff view is
     *   generated
     */

    newView: function (params) {
        var testcase = 'INIT';
        var tid = testcase+params.comp_id
        var btn_base = document.createElement("BUTTON");
        var br_base = document.createElement("BR");
        var div_base = document.createElement("DIV");
        var t = document.createTextNode('+ '+testcase);
        div_base.setAttribute("id", tid);
        div_base.setAttribute("name", testcase);
        div_base.setAttribute("style","display:none")
        btn_base.setAttribute("onClick", 'toggle_visibility("'+tid+'")');
        btn_base.setAttribute("id", tid+'_button');
        btn_base.setAttribute("style", "color:green");
        btn_base.appendChild(t);
//div_base.appendChild(btn);
        div_element = div_base;

        var baseTextLines = params.baseTextLines;
        var newTextLines = params.newTextLines;
        var opcodes = params.opcodes;
        var baseTextName = params.baseTextName ? params.baseTextName : "Base Text";
        var newTextName = params.newTextName ? params.newTextName : "New Text";
        var contextSize = params.contextSize;
        var inline = (params.viewType == 0 || params.viewType == 1) ? params.viewType : 0;

        if (baseTextLines == null)
            throw "Cannot build diff view; baseTextLines is not defined.";
        if (newTextLines == null)
            throw "Cannot build diff view; newTextLines is not defined.";
        if (!opcodes)
            throw "Canno build diff view; opcodes is not defined.";

        function celtnew (name, clazz) {
            var e = document.createElement(name);
            e.className = clazz;
            return e;
        }

        function teltnew (name, text) {
            var e = document.createElement(name);
            e.appendChild(document.createTextNode(text));
            return e;
        }

        function cteltnewnew (name, clazz, text) {

            var e = document.createElement(name);
            e.className = clazz;
            e.appendChild(document.createTextNode(text));
////      Addddddddddd
//      var testcase_match =text.match(/X-TESTCASE-\d{3}/i)
//      if( testcase_match && text.match(/CHECKPOINT/i)){
//        var btn = document.createElement("BUTTON");
//        var div = document.createElement("DIV");
//        var t = document.createTextNode(testcase_match);
//        div.setAttribute("id", testcase_match);
//        div.setAttribute("name", testcase_match);
//        div.setAttribute("style","display = 'none'")
//        div.appendChild(e);
//        btn.setAttribute("onClick", 'toggle_visibility("'+testcase_match+'")');
//        btn.appendChild(t);
//        div.appendChild(btn);
//        testcase = testcase_match
//        div_element = div
////        console.log(text)
//        return div
//      }
//
////      Remove........

            return e;
        }

        var tdata = document.createElement("thead");
        var node = document.createElement("tr");
        tdata.appendChild(node);
        if (inline) {
            node.appendChild(document.createElement("th"));
            node.appendChild(document.createElement("th"));
//      node.appendChild(cteltnewnew("th", "texttitle", baseTextName + " vs. " + newTextName));
        } else {
            node.appendChild(document.createElement("th"));
//      node.appendChild(cteltnewnew("th", "texttitle", baseTextName));
            node.appendChild(document.createElement("th"));
//      node.appendChild(cteltnewnew("th", "texttitle", newTextName));
        }

        tdata = [tdata];

        var rows = [];
        var node2;
        /**
         * Adds two cells to the given row; if the given row corresponds to a real
         * line number (based on the line index tidx and the endpoint of the
         * range in question tend), then the cells will contain the line number
         * and the line of text from textLines at position tidx (with the class of
         * the second cell set to the name of the change represented), and tidx + 1 will
         * be returned.  Otherwise, tidx is returned, and two empty cells are added
         * to the given row.
         */
        function addCellsnew (row, tidx, tend, textLines, change) {

            if (tidx < tend) {
                row.appendChild(teltnew("th", (tidx + 1).toString()));
                row.appendChild(cteltnewnew("td", change, textLines[tidx].replace(/\t/g, "\u00a0\u00a0\u00a0\u00a0")));
                return tidx + 1;
            } else {
                row.appendChild(document.createElement("th"));
                row.appendChild(celtnew("td", "empty"));
                return tidx;
            }
        }

        function addCellsInlinenew (row, tidx, tidx2, textLines, change) {
            //      console.log(textLines[tidx])

            row.appendChild(teltnew("th", tidx == null ? "" : (tidx + 1).toString()));
            row.appendChild(teltnew("th", tidx2 == null ? "" : (tidx2 + 1).toString()));
            row.appendChild(cteltnewnew("td", change, textLines[tidx != null ? tidx : tidx2].replace(/\t/g, "\u00a0\u00a0\u00a0\u00a0")));
        }

        rows.push(btn_base);
        rows.push(br_base);

        for (var idx = 0; idx < opcodes.length; idx++) {
            code = opcodes[idx];
            change = code[0];
            var b = code[1];
            var be = code[2];
            var n = code[3];
            var ne = code[4];
            var rowcnt = Math.max(be - b, ne - n);
            var toprows = [];
            var botrows = [];
            for (var i = 0; i < rowcnt; i++) {
                // jump ahead if we've alredy provided leading context or if this is the first range
                if (contextSize && opcodes.length > 1 && ((idx > 0 && i == contextSize) || (idx == 0 && i == 0)) && change=="equal") {
                    var jump = rowcnt - ((idx == 0 ? 1 : 2) * contextSize);
                    if (jump > 1) {
                        toprows.push(node = document.createElement("tr"));

                        b += jump;
                        n += jump;
                        i += jump - 1;
                        node.appendChild(teltnew("th", "..."));
                        if (!inline) node.appendChild(cteltnewnew("td", "skip", ""));
                        node.appendChild(teltnew("th", "..."));
                        node.appendChild(cteltnewnew("td", "skip", ""));

                        // skip last lines if they're all equal
                        if (idx + 1 == opcodes.length) {
                            break;
                        } else {
                            continue;
                        }
                    }
                }


                // Remove.......
                node = div_element
                var testcase_match =baseTextLines[b] && baseTextLines[b].match(/CHECKPOINT: Test case X-TESTCASE-\d{3}/i)
                if(testcase_match){
//                    console.log(testcase_match)
                    var testcase=baseTextLines[b].match(/X-TESTCASE-\d{3}/i)
                    var tid = testcase+params.comp_id
                    var btn = document.createElement("BUTTON");
                    var br = document.createElement("BR");
                    var div = document.createElement("DIV");
                    var t = document.createTextNode('+ '+ testcase );
                    div.setAttribute("id", tid);
                    div.setAttribute("name", testcase);
                    div.setAttribute("style","display:none")
                    btn.setAttribute("onClick", 'toggle_visibility("'+tid+'")');
                    btn.setAttribute("id", tid+'_button');
                    btn.appendChild(t);
                    btn.setAttribute("style", "color:green");
                    rows.push(btn);
                    rows.push(br);
//          div.appendChild(btn);
                    div_element = div;

                }else{
                    node = document.createElement("tr")
                    div_element.appendChild(node)
                }
                rows.push(div_element);

                //// toprows.push(node = document.createElement("tr"));

                if (inline) {
                    if (change == "insert") {
                        addCellsInlinenew(node, null, n++, newTextLines, change);
                    } else if (change == "replace") {
                        botrows.push(node2 = document.createElement("tr"));
                        if (b < be) addCellsInlinenew(node, b++, null, baseTextLines, "delete");
                        if (n < ne) addCellsInlinenew(node2, null, n++, newTextLines, "insert");
                    } else if (change == "delete") {
                        addCellsInlinenew(node, b++, null, baseTextLines, change);
                    } else {
                        // equal
                        addCellsInlinenew(node, b++, n++, baseTextLines, change);
                    }
                } else {
                    b = addCellsnew(node, b, be, baseTextLines, change);
                    n = addCellsnew(node, n, ne, newTextLines, change);
                }
            }

            for (var i = 0; i < toprows.length; i++) rows.push(toprows[i]);
            for (var i = 0; i < botrows.length; i++) rows.push(botrows[i]);
        }

        rows.push(br);
        tdata.push(node = document.createElement("tbody"));
        for (var idx in rows) rows.hasOwnProperty(idx) && rows[idx] && node.appendChild(rows[idx]);

        node = celtnew("table", "diff" + (inline ? " inlinediff" : ""));
        for (var idx in tdata) tdata.hasOwnProperty(idx) && tdata[idx] && node.appendChild(tdata[idx]);
        return node;
    },

    buildView: function (params) {
        var baseTextLines = params.baseTextLines;
        var newTextLines = params.newTextLines;
        var opcodes = params.opcodes;
        var baseTextName = params.baseTextName ? params.baseTextName : "Base Text";
        var newTextName = params.newTextName ? params.newTextName : "New Text";
        var contextSize = params.contextSize;
        var inline = (params.viewType == 0 || params.viewType == 1) ? params.viewType : 0;

        if (baseTextLines == null)
            throw "Cannot build diff view; baseTextLines is not defined.";
        if (newTextLines == null)
            throw "Cannot build diff view; newTextLines is not defined.";
        if (!opcodes)
            throw "Canno build diff view; opcodes is not defined.";

        function celt (name, clazz) {
            var e = document.createElement(name);
            e.className = clazz;
            return e;
        }

        function telt (name, text) {
            var e = document.createElement(name);
            e.appendChild(document.createTextNode(text));
            return e;
        }

        function ctelt (name, clazz, text) {
            var e = document.createElement(name);
            e.className = clazz;
            e.appendChild(document.createTextNode(text));
            return e;
        }

        var tdata = document.createElement("thead");
        var node = document.createElement("tr");
        tdata.appendChild(node);
        if (inline) {
            node.appendChild(document.createElement("th"));
            node.appendChild(document.createElement("th"));
            node.appendChild(ctelt("th", "texttitle", baseTextName + " vs. " + newTextName));
        } else {
            node.appendChild(document.createElement("th"));
            node.appendChild(ctelt("th", "texttitle", baseTextName));
            node.appendChild(document.createElement("th"));
            node.appendChild(ctelt("th", "texttitle", newTextName));
        }
        tdata = [tdata];

        var rows = [];
        var node2;

        /**
         * Adds two cells to the given row; if the given row corresponds to a real
         * line number (based on the line index tidx and the endpoint of the
         * range in question tend), then the cells will contain the line number
         * and the line of text from textLines at position tidx (with the class of
         * the second cell set to the name of the change represented), and tidx + 1 will
         * be returned.	 Otherwise, tidx is returned, and two empty cells are added
         * to the given row.
         */
        function addCells (row, tidx, tend, textLines, change) {
            if (tidx < tend) {
                row.appendChild(telt("th", (tidx + 1).toString()));
                row.appendChild(ctelt("td", change, textLines[tidx].replace(/\t/g, "\u00a0\u00a0\u00a0\u00a0")));
                return tidx + 1;
            } else {
                row.appendChild(document.createElement("th"));
                row.appendChild(celt("td", "empty"));
                return tidx;
            }
        }

        function addCellsInline (row, tidx, tidx2, textLines, change) {
            row.appendChild(telt("th", tidx == null ? "" : (tidx + 1).toString()));
            row.appendChild(telt("th", tidx2 == null ? "" : (tidx2 + 1).toString()));
            row.appendChild(ctelt("td", change, textLines[tidx != null ? tidx : tidx2].replace(/\t/g, "\u00a0\u00a0\u00a0\u00a0")));
        }

        for (var idx = 0; idx < opcodes.length; idx++) {
            code = opcodes[idx];
            change = code[0];
            var b = code[1];
            var be = code[2];
            var n = code[3];
            var ne = code[4];
            var rowcnt = Math.max(be - b, ne - n);
            var toprows = [];
            var botrows = [];
            for (var i = 0; i < rowcnt; i++) {
                // jump ahead if we've alredy provided leading context or if this is the first range
                if (contextSize && opcodes.length > 1 && ((idx > 0 && i == contextSize) || (idx == 0 && i == 0)) && change=="equal") {
                    var jump = rowcnt - ((idx == 0 ? 1 : 2) * contextSize);
                    if (jump > 1) {
                        toprows.push(node = document.createElement("tr"));

                        b += jump;
                        n += jump;
                        i += jump - 1;
                        node.appendChild(telt("th", "..."));
                        if (!inline) node.appendChild(ctelt("td", "skip", ""));
                        node.appendChild(telt("th", "..."));
                        node.appendChild(ctelt("td", "skip", ""));

                        // skip last lines if they're all equal
                        if (idx + 1 == opcodes.length) {
                            break;
                        } else {
                            continue;
                        }
                    }
                }

                toprows.push(node = document.createElement("tr"));
                if (inline) {
                    if (change == "insert") {
                        addCellsInline(node, null, n++, newTextLines, change);
                    } else if (change == "replace") {
                        botrows.push(node2 = document.createElement("tr"));
                        if (b < be) addCellsInline(node, b++, null, baseTextLines, "delete");
                        if (n < ne) addCellsInline(node2, null, n++, newTextLines, "insert");
                    } else if (change == "delete") {
                        addCellsInline(node, b++, null, baseTextLines, change);
                    } else {
                        // equal
                        addCellsInline(node, b++, n++, baseTextLines, change);
                    }
                } else {
                    b = addCells(node, b, be, baseTextLines, change);
                    n = addCells(node, n, ne, newTextLines, change);
                }
            }

            for (var i = 0; i < toprows.length; i++) rows.push(toprows[i]);
            for (var i = 0; i < botrows.length; i++) rows.push(botrows[i]);
        }

        tdata.push(node = document.createElement("tbody"));
        for (var idx in rows) rows.hasOwnProperty(idx) && node.appendChild(rows[idx]);

        node = celt("table", "diff" + (inline ? " inlinediff" : ""));
        for (var idx in tdata) tdata.hasOwnProperty(idx) && node.appendChild(tdata[idx]);
        return node;
    }


};
