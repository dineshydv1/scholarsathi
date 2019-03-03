module.exports = (sequelize, Sequelize)=>{
    const CategorySchema = sequelize.define('Categories', {
        name: {
            type: Sequelize.STRING,
            trim: true,
            allowNull: false,
            defaultValue: '',
            validate: {
                notEmpty: { msg: 'Name is required'},
            }
        },
        img: {
            type: Sequelize.STRING,
            allowNull: true
        }
    },{
        timestamps: false
    }); 
    return CategorySchema; 
}
