openerp.account_sequence_sasmar = function(instance) {
var _t = instance.web._t;
var QWeb = instance.web.qweb;
   
instance.web.TreeView.include({
	    load_tree: function (fields_view) {
        var self = this;
        console.log('fields viewwwwwwwwwww',fields_view);
        var has_toolbar = !!fields_view.arch.attrs.toolbar;
        // field name in OpenERP is kinda stupid: this is the name of the field
        // holding the ids to the children of the current node, why call it
        // field_parent?
        this.children_field = fields_view['field_parent'];
        this.fields_view = fields_view;
        _(this.fields_view.arch.children).each(function (field) {
            if (field.attrs.modifiers) {
                field.attrs.modifiers = JSON.parse(field.attrs.modifiers);
            }
        });
        this.fields = fields_view.fields;
        this.hook_row_click();
        this.$el.html(QWeb.render('TreeView', {
            'title': this.fields_view.arch.attrs.string,
            'fields_view': this.fields_view.arch.children,
            'fields': this.fields,
            'toolbar': has_toolbar
        }));
        this.$el.addClass(this.fields_view.arch.attrs['class']);

        this.dataset.read_slice(this.fields_list()).done(function(records) {
            console.log("recsssssssssssssssordsssssssssss",this);
			if (fields_view.model == "account.account"){
                console.log("recordsssssssssss",_.sortBy(records, 'sequence'));
                records = _.sortBy(records, 'sequence');
                }
            if (!has_toolbar) {
                // WARNING: will do a second read on the same ids, but only on
                //          first load so not very important
                self.getdata(null, _(records).pluck('id'));
                return;
            }

            var $select = self.$el.find('select')
                .change(function () {
                    var $option = $(this).find(':selected');
                    self.getdata($option.val(), $option.data('children'));
                });
            _(records).each(function (record) {
                self.records[record.id] = record;
                $('<option>')
                        .val(record.id)
                        .text(record.name)
                        .data('children', record[self.children_field])
                    .appendTo($select);
            });

            if (!_.isEmpty(records)) {
                $select.change();
            }
        });

        // TODO store open nodes in url ?...
        this.do_push_state({});

        if (!this.fields_view.arch.attrs.colors) {
            return;
        }
        this.colors = _(this.fields_view.arch.attrs.colors.split(';')).chain()
            .compact()
            .map(function(color_pair) {
                var pair = color_pair.split(':'),
                    color = pair[0],
                    expr = pair[1];
                return [color, py.parse(py.tokenize(expr)), expr];
            }).value();
    },

});
}    

