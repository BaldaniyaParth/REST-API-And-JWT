const oneMinuteExpiry = async (otpTime) => {
  try {
    const c_datetime = new Date();

    var differenceValue = (otpTime - c_datetime.getTime()) / 1000;
    differenceValue /= 60;

    if (Math.abs(differenceValue) > 1) {
      return true;
    }

    return false;
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Something Worng...",
    });
  }
};

const threeMinuteExpiry = async (otpTime) => {
  try {
    const c_datetime = new Date();

    var differenceValue = (otpTime - c_datetime.getTime()) / 1000;
    differenceValue /= 60;

    if (Math.abs(differenceValue) > 3) {
      return true;
    }

    return false;
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Something Worng...",
    });
  }
};

module.exports = { oneMinuteExpiry, threeMinuteExpiry };
