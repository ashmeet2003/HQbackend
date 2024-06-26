import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (userId, res) => {
	const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: "15d",
	});

	//response
	res.cookie("jwt", token, {
		maxAge: 15 * 24 * 60 * 60 * 1000, // milliseconds
		httpOnly: true, // prevent cross-site scripting attacks
		sameSite: "strict", //cross-site request forgery attacks
		secure: process.env.NODE_ENV !== "development",
	});
};

export default generateTokenAndSetCookie;