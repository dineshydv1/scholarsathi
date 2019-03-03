module.exports = (sequelize, Sequelize) => {
    const StateSchema = sequelize.define('State', {
        country_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            // references: {
            //     model: 'Country',
            //     key: 'id'
            // }
        },
        name: {
            type: Sequelize.STRING,
            trim: true,
            allowNull: false,
            defaultValue: '',
            validate: {
                notEmpty: { msg: 'Name is required' },
            }
        },
        time: {
            type: Sequelize.STRING,
            allowNull: false,
        }
    }, {
            timestamps: false
        });
    return StateSchema;
}
