module.exports = (sequelize, Sequelize)=>{
    const HeaderMenuSchema = sequelize.define('HeaderMenu', {
        name: {
            type: Sequelize.STRING,
            trim: true,
            allowNull: false,
            defaultValue: '',
            validate: {
                notEmpty: { msg: 'Name is required'},
            }
        },
        subcategories: {
            type: Sequelize.STRING,
            trim: true,
            allowNull: false,
            defaultValue: '',
            validate: {
                notEmpty: { msg: 'Subcategory is required'},
            }
        },
        order: {
            type: Sequelize.STRING,
            trim: true,
            allowNull: false,
            defaultValue: '',
            validate: {
                notEmpty: { msg: 'Order is required'},
            }
        },
        search_below: {
            type: Sequelize.ENUM,
            values: ['y', 'n'],
            defaultValue: 'n'
        }
    },{
        timestamps: false
    }); 
    return HeaderMenuSchema; 
}
