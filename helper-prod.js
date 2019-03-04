const moment = require('moment');
//var baseUrl = 'http://localhost:5000'; // development
var baseUrl = 'https://www.scholarsathi.com'; // production

module.exports = {
    baseUrl: () => baseUrl,
    publicUrl: () => baseUrl + '/public',
    publicPanelUrl: () => baseUrl + '/public/panel',
    selectedSelectOption: function (a, b) {
        return a == b ? 'selected' : null;
    },
    checkedSingleOption: function (a, b) {
        return a == b ? 'checked' : null;
    },
    dateFormat: function (date, formatDate, options) {
        if (options == undefined) {
            options = formatDate;
            formatDate = 'DD-MM-YYYY';
        }
        // console.log(date, ' - ',moment(date).format(),  moment(date).utcOffset("+05:30").format(), moment(date));
        return moment(date).utcOffset("+05:30").format(formatDate);
    },
    multiCheckedCheckbox: (id, selectedIds) => {
        if (!selectedIds) return null;
        if (!Array.isArray(selectedIds)) selectedIds = selectedIds.split(',');
        return selectedIds.indexOf(id.toString()) > -1 ? 'checked' : null;
    },
    multiSelectedSelectOption: (id, selectedIds) => {
        if (!selectedIds) return null;
        if (!Array.isArray(selectedIds)) selectedIds = selectedIds.split(',');
        return selectedIds.indexOf(id.toString()) > -1 ? 'selected' : null;
    },
    indexNumber: (inc) => parseInt(inc) + 1,
    activeClass: (x, y) => x == y ? 'active' : '',
    section: function (name, options) {
        if (!this._sections) {
            this._sections = {};
        }
        this._sections[name] = options.fn(this);
        return null;
    },
    compare: function (lValue, operator, rValue, options) {
        let operators, result;
        if (arguments.length < 3) {
            throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
        }

        if (options == undefined) {
            options = rValue;
            rValue = operator;
            operator = '==';
        }

        operators = {
            '==': function (l, r) { return l == r; },
            '===': function (l, r) { return l === r; },
            '!=': function (l, r) { return l != r; },
            '!==': function (l, r) { return l !== r; },
            '<': function (l, r) { return l < r; },
            '>': function (l, r) { return l > r; },
            '<=': function (l, r) { return l <= r; },
            '>=': function (l, r) { return l >= r; },
            'typeof': function (l, r) { return typeof l == r; }
        };

        if (!operators[operator]) {
            throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
        }

        result = operators[operator](lValue, rValue);
        if (result) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    },
    socialUrl: (url) => {
        if (url) return url;
        return baseUrl;
    },
    myProfilePregress: (user, style) => {
        let keys = ['first_name', 'last_name', 'email', 'mobile', 'gender_id', 'address', 'date_of_birth', 'pincode', 'category_id', 'annual_family_income', 'religion_id', 'city_id', 'state_id', 'qualification_id', 'passing_year', 'passing_month', 'institute_name', 'institute_pincode', 'institute_state_id', 'institute_city_id'];
        let i = 0;
        keys.map((d) => {
            if (user.hasOwnProperty(d)) {
                if (user[d]) i++;
            }
        });
        let val = Math.floor((98 / keys.length) * i);
        if (user.email_verified == 'y') val++
        if (user.mobile_verified == 'y') val++
        if (style == 'style') {
            return `style="width: ${val}%"`
        }
        return val;
    },
    smallIf: (lValue, rValue, data1, data2) => {
        if (lValue == rValue) return data1;
        return data2;
    },
    assetsUrl: (url) => {
        if (url) { return baseUrl + url; }
        return null;
    }

}