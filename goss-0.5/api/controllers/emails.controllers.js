var nodemailer = require("nodemailer");

module.exports.sendConfirmationEmail = function(req, res) {
	var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "happyeoms@gmail.com",
        pass: "f(x)=x^2+77"
    	}
	});
	var rand, mailOptions, host, link;

	rand=Math.floor((Math.random() * 100) + 54);
    host=req.get('host');
    link="http://"+req.get('host')+"/verify?id="+rand;
    mailOptions={
        to : req.query.to,
        subject : "Please confirm your Email account",
        html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>" 
    }
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, response){
     if(error){
        console.log(error);
        res.end("error");
     }else{
        console.log("Message sent: " + response.message);
        res.end("sent");
     }
	});
};

module.exports.verifyEmail = function(req,res){
	console.log(req.protocol+":/"+req.get('host'));
	if((req.protocol+"://"+req.get('host'))==("http://"+host))
	{
	    console.log("Domain is matched. Information is from Authentic email");
	    if(req.query.id==rand)
	    {
	        console.log("email is verified");
	        res.end("<h1>Email "+mailOptions.to+" has been Successfully verified");
	    }
	    else
	    {
	        console.log("email is not verified");
	        res.end("<h1>Bad Request</h1>");
	    }
	}
	else
	{
	    res.end("<h1>Request is from unknown source");
	}
};
