function kvm(opts) {
	var data = opts.data;

	var id = opts.id;
	var childNodes = document.getElementById(id).childNodes;

	for(var i = 0; i < childNodes.length; i++) {

	}
}

function scanNodeArray(nodes) {
	for (var i = 0, node; node = nodes[i++]; ) {
        switch (node.nodeType) {
            case 1:
                var elem = node, fn
                scanTag(node) //扫描元素节点
                // if (node.msHasEvent) {
                //     avalon.fireDom(node, "datasetchanged", {
                //         bubble: node.msHasEvent
                //     })
                // }

                break
            case 3:
                // if (rexpr.test(node.nodeValue)) {
                //     scanText(node, vmodels, i) //扫描文本节点
                // }
                break
        }

    }
}

function scanAttr(elem, vmodels, match) {
    var scanNode = true
    if (vmodels.length) {
        var attributes = getAttributes ? getAttributes(elem) : elem.attributes
        var bindings = []
        var uniq = {}
        for (var i = 0, attr; attr = attributes[i++]; ) {
            var name = attr.name
            if (uniq[name]) {//IE8下ms-repeat,ms-with BUG
                continue
            }
            uniq[name] = 1
            if (attr.specified) {
                if (match = name.match(rmsAttr)) {
                    //如果是以指定前缀命名的
                    var type = match[1]
                    var param = match[2] || ""
                    var value = attr.value
                    if (events[type]) {
                        param = type
                        type = "on"
                    } else if (obsoleteAttrs[type]) {
                        param = type
                        type = "attr"
                        name = "ms-" + type + "-" + param
                        log("warning!请改用" + name + "代替" + attr.name + "!")
                    }
                    if (directives[type]) {
                        var newValue = value.replace(roneTime, "")
                        var oneTime = value !== newValue
                        var binding = {
                            type: type,
                            param: param,
                            element: elem,
                            name: name,
                            expr: newValue,
                            oneTime: oneTime,
                            uniqueNumber: attr.name + "-" + getUid(elem),
                            //chrome与firefox下Number(param)得到的值不一样 #855
                            priority: (directives[type].priority || type.charCodeAt(0) * 10) + (Number(param.replace(/\D/g, "")) || 0)
                        }
                        if (type === "html" || type === "text") {

                            var filters = getToken(value).filters
                            binding.expr = binding.expr.replace(filters, "")

                            binding.filters = filters.replace(rhasHtml, function () {
                                binding.type = "html"
                                binding.group = 1
                                return ""
                            }).trim() // jshint ignore:line
                        } else if (type === "duplex") {
                            var hasDuplex = name
                        } else if (name === "ms-if-loop") {
                            binding.priority += 100
                        } else if (name === "ms-attr-value") {
                            var hasAttrValue = name
                        }
                        bindings.push(binding)
                    }
                }
            }
        }
        if (bindings.length) {
            bindings.sort(bindingSorter)
            //http://bugs.jquery.com/ticket/7071
            //在IE下对VML读取type属性,会让此元素所有属性都变成<Failed>
            if (hasDuplex && hasAttrValue && elem.nodeName === "INPUT" && elem.type === "text") {
                log("warning!一个控件不能同时定义ms-attr-value与" + hasDuplex)
            }
            for (i = 0; binding = bindings[i]; i++) {
                type = binding.type
                if (rnoscanAttrBinding.test(type)) {
                    return executeBindings(bindings.slice(0, i + 1), vmodels)
                } else if (scanNode) {
                    scanNode = !rnoscanNodeBinding.test(type)
                }
            }

            executeBindings(bindings, vmodels)
        }
    }
    if (scanNode && !stopScan[elem.tagName] && (isWidget(elem) ? elem.msResolved : 1)) {
        mergeTextNodes && mergeTextNodes(elem)
        scanNodeList(elem, vmodels) //扫描子孙元素

    }
}


function scanTag(elem) {

	scanAttr(elem);

	if (elem.childNodes) {
		scanNodeArray(elem.childNodes);
	}

}