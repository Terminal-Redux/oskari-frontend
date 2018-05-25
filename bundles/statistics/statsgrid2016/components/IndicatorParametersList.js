/**
 * This component manage the different year/regionset combinations listing for indicator data.
 * Also asks for selector values/regionset when user adds another dataset (selector combination for indicator)
 */
Oskari.clazz.define('Oskari.statistics.statsgrid.IndicatorParametersList', function (locale) {
    this.locale = locale;
    this.element = null;
    this.addDatasetButton = null;
    this.availableRegionsets = [];
    this.select = Oskari.clazz.create('Oskari.userinterface.component.SelectList');
    // this.regionselect = Oskari.clazz.create('Oskari.statistics.statsgrid.RegionsetSelector', service, locale);
    this.createUi();
    Oskari.makeObservable(this);
}, {
    __templates: {
        main: _.template('<div class="user-indicator-main"><ul></ul><div class="new-indicator-dataset-params"><div class="util-row"></div></div></div>'),
        listItem: _.template('<li>${year} - ${regionset}</li>'),
        form: '<form class="indicator-selectors-form" style="width: 25%"></form>',
        input: _.template('<input type="text" style="width: 80%" id="year-input" name="${name}" placeholder="${label}"><br />'),
        import: _.template('<div class="user-indicator-import"><textarea placeholder="${placeholder}"></textarea></div>')
    },
    getElement: function () {
        return this.element;
    },
    createUi: function () {
        if (this.getElement()) {
            return this.getElement();
        }
        var me = this;

        var main = jQuery(this.__templates.main());
        this.element = main;

        var indBtn = Oskari.clazz.create('Oskari.userinterface.component.Button');
        indBtn.setTitle(this.locale('userIndicators.buttonAddIndicator'));
        indBtn.insertTo(main);
        this.addDatasetButton = indBtn;

        indBtn.setHandler(function (event) {
            event.stopPropagation();
            me.requestIndicatorSelectors();
        });
        return this.getElement();
    },
    setDatasets: function (datasets) {
        var me = this;
        var listEl = this.getElement().find('ul');
        listEl.empty();
        if (!datasets) {
            return;
        }
        datasets.forEach(function (dataset) {
            // TODO: formatting/nice UI
            var item = me.__templates.listItem({
                year: me.locale('parameters.year') + ' ' + dataset.year,
                regionset: me.getRegionsetName(dataset.regionset)
            });
            // TODO: add edit/delete links
            /* for edit:
            me.trigger('insert.data', {
                year: dataset.year,
                regionset: dataset.regionset
            });
            for delete:
            me.trigger('delete.data', {
                year: dataset.year,
                regionset: dataset.regionset
            });
            */
            listEl.append(item);
        })
    },
    setRegionsets: function (availableRegionsets) {
        this.availableRegionsets = availableRegionsets;
    },
    getRegionsetName: function (id) {
        var regionset = this.availableRegionsets.find(function (regionset) {
            return regionset.id === id;
        });
        if (regionset) {
            return regionset.name;
        }
        return id;
    },
    resetIndicatorSelectors: function (showInsertButton) {
        var formContainer = this.getElement().find('.new-indicator-dataset-params');
        formContainer.empty();
        this.addDatasetButton.setVisible(showInsertButton);
        return formContainer;
    },
    requestIndicatorSelectors: function () {
        var form = jQuery(this.__templates.form);
        // TODO: year etc as params
        var input = jQuery(this.__templates.input({
            name: 'year',
            label: this.locale('parameters.year')
        }));
        form.append(input);
        var formContainer = this.resetIndicatorSelectors(false);
        formContainer.append(form);
        var regionsetContainer = jQuery('<div></div>');
        regionsetContainer.append(this.locale('panels.newSearch.selectRegionsetPlaceholder'));
        regionsetContainer.append(this.select.create(this.availableRegionsets, {
            allow_single_deselect: false,
            placeholder_text: this.locale('panels.newSearch.selectRegionsetPlaceholder'),
            width: '100%'
        }));
        this.select.selectFirstValue();
        this.select.adjustChosen();

        formContainer.append(regionsetContainer);
        var btnContainer = jQuery('<div style="display:flex"></div>');
        formContainer.append(btnContainer);

        var me = this;
        var cancelBtn = Oskari.clazz.create('Oskari.userinterface.component.buttons.CancelButton');
        cancelBtn.insertTo(btnContainer);
        cancelBtn.setHandler(function (event) {
            me.resetIndicatorSelectors(true);
        });
        var showTableBtn = Oskari.clazz.create('Oskari.userinterface.component.buttons.AddButton');
        showTableBtn.insertTo(btnContainer);
        showTableBtn.setHandler(function (event) {
            me.resetIndicatorSelectors(true);
            me.trigger('insert.data', {
                year: input.val(),
                regionset: Number(me.select.getValue())
            });
        });
        var importClipboard = Oskari.clazz.create('Oskari.userinterface.component.buttons.AddButton');
        importClipboard.insertTo(btnContainer);
        importClipboard.setTitle('Tuo leikepöydältä');
        importClipboard.setHandler(function (event) {
            me.openImportPopup();
        });
    },
    openImportPopup: function () {
        var me = this;
        var popup = Oskari.clazz.create('Oskari.userinterface.component.Popup');
        popup.makeDraggable();
        var content = jQuery(this.__templates.import({
            placeholder: me.locale('userIndicators.import.placeholder')
        }));
        var okBtn = Oskari.clazz.create('Oskari.userinterface.component.buttons.OkButton');

        okBtn.setPrimary(true);
        okBtn.setHandler(function () {
            var textarea = content.find('textarea');
            var data = me.parseUserData(textarea);
            var input = me.getElement().find('#year-input');
            me.trigger('import.user.data', {
                'data': data,
                'selectors': {
                    'year': input.val(),
                    'regionset': Number(me.select.getValue())
                }
            });
            popup.close(true);
        });
        var cancelBtn = Oskari.clazz.create('Oskari.userinterface.component.buttons.CancelButton');
        cancelBtn.setHandler(function () {
            popup.close(true);
        });
        popup.show('Tuo leikepöydältä', content, [cancelBtn, okBtn]);
    },
    parseUserData: function (data) {
        var data = data.val();
        var validRows = [];
        // update form regions / municipalities
        var updateValue = function (name, value) {
            validRows.push({
                'name': name,
                'id': name,
                'value': value
            });
        };
        var lines = data.match(/[^\r\n]+/g);
        var updated = 0;
        var unrecognized = [];
        // loop through all the lines and parse municipalities (name or code)
        _.each(lines, function (line) {
            var area,
                value;

            // separator can be tabulator, comma or colon
            var matches = line.match(/([^\t;,]+) *[\t;,]+ *(.*)/);
            if (matches && matches.length === 3) {
                area = matches[1];
                value = (matches[2] || '').replace(',', '.').replace(/\s/g, '');
            }
            // update municipality values
            if (updateValue(jQuery.trim(area), jQuery.trim(value))) {
                updated += 1;
            } else if (value && value.length > 0) {
                unrecognized.push({
                    region: area,
                    value: value
                });
            }
        });
        return validRows;
    }
});
