module.exports = (sequelize, Sequelize)=>{
    const BestScholarshipSchema = sequelize.define('BestScholarship', {
        name: {
            type: Sequelize.STRING,
            trim: true,
            allowNull: false,
            defaultValue: '',
            validate: {
                notEmpty: { msg: 'Name is required'},
            }
        },
        sub_title: {
            type: Sequelize.STRING,
            trim: true,
            allowNull: false,
            defaultValue: '',
            validate: {
                notEmpty: { msg: 'Sub title is required'},
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
        img: {
            type: Sequelize.STRING,
            allowNull: true
        }
    },{
        timestamps: false
    }); 
    return BestScholarshipSchema; 
}
