module.exports = (sequelize, Sequelize) => {
  const Receipt = sequelize.define('Receipt', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    paymentId: {
      type: Sequelize.STRING,
      allowNull: false
    },
    roomIds: {
      type: Sequelize.ARRAY(Sequelize.INTEGER), // หรือ JSON ถ้าต้องการเก็บข้อมูลเพิ่มเติม
      allowNull: false
    },
    paymentStatus: {
      type: Sequelize.STRING,
      allowNull: false
    },
    totalPrice: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
    dueDate: {
      type: Sequelize.DATE,
      allowNull: false
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    checkIn: {
      type: Sequelize.DATE,
      allowNull: false
    },
    checkOut: {
      type: Sequelize.DATE,
      allowNull: false
    },
    adults: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    children: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    promotions: {
      type: Sequelize.ARRAY(Sequelize.STRING), // หรือ JSON ถ้าต้องการเก็บข้อมูลเพิ่มเติม
      allowNull: true
    },
    roomType: {
      type: Sequelize.ARRAY(Sequelize.STRING), // หรือ JSON ถ้าต้องการเก็บข้อมูลเพิ่มเติม
      allowNull: false
    }
  }, {
    tableName: 'receipts',
    timestamps: true
  });

  return Receipt;
};