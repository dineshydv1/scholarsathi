module.exports = (sequelize, Sequelize) => {
    const UserEntranceExamSchema = sequelize.define('UserEntranceExam', {
        name: {
            type: Sequelize.STRING,
            trim: true,
            allowNull: false,
            defaultValue: '',
            validate: {
                notEmpty: { msg: 'Name is required' },
            }
        },
        level:{
            type: Sequelize.STRING,
            allowNull: true,
            
        },
        qualification:{
            type: Sequelize.STRING,
            allowNull: true,
           
        },
        occupation:{
            type: Sequelize.STRING,
            allowNull: true,
           
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        
    });

    return UserEntranceExamSchema;
}
