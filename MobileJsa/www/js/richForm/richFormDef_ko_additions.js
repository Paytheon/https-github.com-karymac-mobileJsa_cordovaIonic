// Copyright © 2015 by Bit Smasher Labs.  All Rights Reserved.

/// <reference path="common.js" />

ko.bindingHandlers.mjsaRichFormDefBindingHandler = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var value = ko.utils.unwrapObservable(valueAccessor());

        // Apply width/height if present.
        var av = element.getAttribute('data-val-width');
        if (av != null) {
            var e = $(element);
            e.css('width', av);
        }
        av = element.getAttribute('data-val-height');
        if (av != null) {
            var e = $(element);
            e.css('height', av);
        }

        // Wireup signature control.
        av = element.getAttribute('data-type');
        if (av != null && av == 'signature') {
            // Initialize.
            $(element).jSignature();

            // Load sig from observable if data present.
            var existingSigData = viewModel[element.getAttribute('data-name')]();
            if (existingSigData != null) {
                $(element).jSignature("setData", "data:" + existingSigData.join(","));
            }

            // Wireup change notification event handler to update backing observable in VM.
            $(element).bind('change', function (e) {
                var sigData = $(e.target).jSignature("getData", 'base30');
                viewModel[e.target.getAttribute('data-name')](sigData);
            });
        }
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var value = ko.utils.unwrapObservable(valueAccessor());

        var isValid = true;
        var invalidReason = '';

        var av = element.getAttribute('data-val-required');
        if (av != null && av == 'true') {
            // Validate required if present.
            if (isValid) {
                // Handle checkbox/radio specially.  Required means must be checked.
                if (element.type == 'checkbox' || element.type == 'radio') {
                    if (value == null || !value) {
                        isValid = false;
                        invalidReason = '<='; // just show asterisk next to checkbox/radio
                    }
                } else {
                    if (value == null
                        || (typeof (value) == 'string' && value.length == 0)
                        ) {
                        isValid = false;
                        invalidReason = 'Required';
                    }
                }
            }
        }

        // Validate min length if present.
        if (isValid && typeof (value) == 'string') {
            var av = element.getAttribute('data-val-min');
            if (av != null) {
                var v = parseInt(av);
                if (value.length < v) {
                    isValid = false;
                    invalidReason = 'Too short';
                }
            }
        }

        // Validate max length if present.
        if (isValid && typeof (value) == 'string') {
            var av = element.getAttribute('data-val-max');
            if (av != null) {
                var v = parseInt(av);
                if (value.length > v) {
                    isValid = false;
                    invalidReason = 'Too long';
                }
            }
        }

        viewModel[element.getAttribute('data-name') + '_isValid'](isValid);
        viewModel[element.getAttribute('data-name') + '_invalidReason']('* '+invalidReason);
    }
};
