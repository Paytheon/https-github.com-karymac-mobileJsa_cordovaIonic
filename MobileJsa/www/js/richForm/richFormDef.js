// Copyright © 2015 by Bit Smasher Labs.  All Rights Reserved.

(function (richFormDefNs, $, undefined) {
    "use strict";

    // Define mapping between markup and html elements.
    var markupMap = [
        {
            srcElementName: 'mjsatext',
            // eg, <mjsatext data-name="txtFieldName" data-val-max="100" data-val-min="1" data-val-regex="regex" data-val-required="false" data-val-width="100">
            // note: all attribs starting with 'data-' automatically convey.
            // note: names in target prepended w/ underscore having their non-alphanumeric chars replaced w/ underscore, eg data-name='this that" becomes 'this_that'.
            // note: the mjsaRichFormDefBindingHandler performs the following:
            //      > auto-validates using data-val min/max/regex/required if present.
            //      > applies data-val-width to CSS style if present
            //      > auto-created observable isValid prop for each data-name, eg if data-name = 'this that', obs = 'this_that_isValid'
            dstElementTemplate: "<input type='text' class='mjsatext' data-name='$_data-name$' data-bind='value: $_data-name$, valueUpdate: \"keyup\", mjsaRichFormDefBindingHandler: $_data-name$' />",
            observables: ['_data-name']
        },
        {
            srcElementName: 'mjsatextarea',
            dstElementTemplate: "<textarea data-name='$_data-name$' class='mjsatextarea' data-bind='value: $_data-name$, valueUpdate: \"keyup\", mjsaRichFormDefBindingHandler: $_data-name$' />",
            observables: ['_data-name']
        },
        {
            srcElementName: 'mjsacheckbox',
            dstElementTemplate: "<input type='checkbox' class='mjsacheckbox' data-name='$_data-name$' data-bind='checked: $_data-name$, valueUpdate: \"keyup\", mjsaRichFormDefBindingHandler: $_data-name$' />",
            observables: ['_data-name']
        },
        {
            srcElementName: 'mjsaradio',
            dstElementTemplate: "<input type='radio' class='mjsaradio' data-name='$_data-name$' name='$_data-name$' value='$data-val-value$' data-bind='checked: $_data-name$, valueUpdate: \"keyup\", mjsaRichFormDefBindingHandler: $_data-name$' />",
            observables: ['_data-name']
        },
        {
            srcElementName: 'mjsadate',
            dstElementTemplate: "<input type='date' class='mjsadate' data-name='$_data-name$' data-bind='value: $_data-name$, valueUpdate: \"keyup\", mjsaRichFormDefBindingHandler: $_data-name$' />",
            //dstElementTemplate: "<input type='text' class='mjsadate' data-name='$_data-name$' data-bind='value: $_data-name$, valueUpdate: \"keyup\", mjsaRichFormDefBindingHandler: $_data-name$' />",
            observables: ['_data-name']
        },
        {
            srcElementName: 'mjsasignature',
            dstElementTemplate: "<div data-type='signature' data-name='$_data-name$' style='border-style:solid;border-width:2px' data-bind='mjsaRichFormDefBindingHandler: $_data-name$' />",
            observables: ['_data-name']
        }
    ];
    var validationError = "<span data-bind='visible: !$_data-name$_isValid(), text: $_data-name$_invalidReason, valueUpdate: \"keyup\"' style='color:red;font-weight:bold;margin-left:10px'/>";

    richFormDefNs.init = function () {
    }

    // Given htmlWithMarkup containing <mjsaEtc> elements.
    // Returns html with markup replaced, ready for use as a data entry form,
    // and a list of variable names required to be present in form's viewmodel as observables.
    // Returns { html: '', observables: ['',''] }.
    richFormDefNs.convertHtmlWithMarkupToRichFormDef = function (htmlWithMarkup) {
        var ic = 0; // current index as we search for markups in html.
        var is = -1; // index of first space found after opening markup element.
        var ie = -1; // index of closing > in element.
        var icte = -1; // index of closing tag's closing >
        var tag = ''; // tag string, eg <mjsatext blah=blah>
        var closingTag = '';
        var srcEl = null; // tag as jquery element
        var dstEl = null; // dst tag as jquery element
        var map = null; // markup map entry for element.
        var elementTemplate = '';
        var observables = []; // array of string observable names.
        var divVal = null; // validation div

        while (true) {
            // get start of next markup element.
            ic = htmlWithMarkup.indexOf('<mjsa', ic+1);
            if (ic < 0)
                break;

            // find first space after start of found markup element.
            is = htmlWithMarkup.indexOf(' ', ic+1);
            if (is < 0)
                throw 'Invalid markup; no space found after opening markup element.';

            // find tag's closing bracket.
            ie = htmlWithMarkup.indexOf('>', is + 1);
            if (ie < 0)
                throw 'Invalid markup; no ending bracket found for markup element.';

            // get tag as string
            tag = htmlWithMarkup.substring(ic, ie + 1);
            //console.log(tag);

            // convert to element for easy use
            srcEl = $(tag);
            
            // get info to map src to dst element.
            map = $.grep(markupMap, function (m,i) {
                return m.srcElementName === srcEl[0].localName;
            });
            if (map == null || map.length != 1)
                throw 'No conversion for ' + srcEl[0].localName;
            map = map[0];

            // Replace placeholders in element template.
            elementTemplate = replaceTemplatePlaceholders(map.dstElementTemplate, srcEl);

            // Use to create dest element.
            dstEl = $(elementTemplate);

            // From srcEl, add all attribs starting w/ 'data-' to dstEl.
            autoAddDataParams(srcEl, dstEl);

            // Find end of closing tag.
            closingTag = '</' + srcEl[0].localName +'>';
            icte = htmlWithMarkup.indexOf(closingTag, ie + 1);
            if (icte < 0)
                throw 'Invalid markup; no closing tag for markup element.';
            icte += closingTag.length;

            // prepare validation div
            divVal = $(replaceTemplatePlaceholders(validationError, srcEl));

            // splice prepared element into html.
            htmlWithMarkup =
                htmlWithMarkup.slice(0, ic)
                + dstEl[0].outerHTML
                + divVal[0].outerHTML
                + htmlWithMarkup.slice(icte);

            // add list of observables required for this data entry element
            // to the list returned to the caller.
            $.each(map.observables, function (i, attribName) {
                var v = getAttributeValue(srcEl, attribName);
                if (observables.indexOf(v) < 0)
                    observables.push(v);
            });
        }

        return {
            html: htmlWithMarkup,
            observables: observables
        };
    }

    richFormDefNs.createViewModelForRichForm = function(rfd) {
        var vm = {};
        // observables is an array of strings, names of observables to create.
        $.each(rfd.observables, function (i, nm) {
            // create observable for data binding.
            vm[nm] = ko.observable();
            // create observables for validation
            vm[nm + "_isValid"] = ko.observable(true);
            vm[nm + "_invalidReason"] = ko.observable('');
        });
        return vm;
    }


    // Replace template placeholders (eg $_data-name$) with attribute values.
    // If placeholder prefixed with underscore, means the attrib value must
    // be converted to a js-compat variable name (ie, spaces replaced with underscores, etc).
    function replaceTemplatePlaceholders(elementTemplate, srcEl) {
        var ary = elementTemplate.split('$');
        var output = '';
        $.each(ary, function (i, e) {
            if (i % 2 == 0)
                output += e;
            else {
                var attribName = e;
                var v = getAttributeValue(srcEl, attribName);
                output += v;
            }
        });
        //console.log('replaced: '+output);
        return output;
    }

    // Get value of attribute, converting value to identifier
    // if attribute name starts with underscore.
    function getAttributeValue(srcEl, attribName) {
        var convertToIdentifier = false;
        if (attribName.startsWith('_')) {
            convertToIdentifier = true;
            attribName = attribName.substr(1);
        }

        var v = srcEl.attr(attribName);
        if (convertToIdentifier) {
            var s = '';
            var c = '';
            for (var i = 0, len = v.length; i < len; i++) {
                c = v[i];
                if (/^[a-z0-9]+$/i.test(c))
                    s += c;
                else
                    s += '_';
            }
            v = s;
        }
        return v;
    }

    // srcEl, dstEl are jquery objects.  Add all srcEl attribs
    // starting w/ 'data-' to dstEl.
    function autoAddDataParams(srcEl, dstEl) {
        // auto-add attribs with 'data-' prefix to dstEl.
        $.each(srcEl[0].attributes, function (i, a) {
            if (a.nodeName.startsWith('data-val-')) {
                dstEl.attr(a.nodeName, a.nodeValue);
            }
        });
    }

}(window.richFormDefNs = window.richFormDefNs || {}, jQuery));
