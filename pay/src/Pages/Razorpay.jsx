import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./Razorpay.css";
import axios from "axios";
import Logo from "../assets/Protutor_Logo.png";
import Logo1 from "../assets/success.png";

function Razorpay() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const planId = params.get("sub_id");
// const planId = "SPP001"
  console.log(planId);
  const [paymentResponse, setPaymentResponse] = useState(null);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    amount: "",
    phone: "",
    planname: "",
    credit: "",
  });



  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const sub_id = planId;
      let response;

      if (sub_id.startsWith("SPP")) {
        response = await axios.get(
          `http://3.27.116.137:3000/getparentplanId?sub_id=${sub_id}`
        );
      } else if (sub_id.startsWith("SPT")) {
        response = await axios.get(
          `http://3.27.116.137:3000/gettutorplanId?sub_id=${sub_id}`
        );
      } else if (sub_id.startsWith("SPS")) {
        response = await axios.get(
          `http://3.27.116.137:3000/getstudentplanid?sub_id=${sub_id}`
        );
      } else {
        console.error("Invalid sub_id format");
        return;
      }
      // console.log(response.data.parent_id);
      const { fname, email, plancost, plan_name, count } = response.data;
      setUserData({
        name: fname,
        email: email,
        amount: plancost,
        planname: plan_name,
        credit: count,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handlePayment = async () => {
    if (userData.amount === "") {
      alert("Please enter amount");
      return;
    }

    try {
      const options = {
        key: "rzp_test_6cNn6KMffozSlf",
        key_secret: "SnYdnBbooGTuzQfK1txNflzI",
        amount: userData.amount * 100,
        currency: "MYR",
        name: "Hackwit Technologies",
        description: "Razorpay testing",
        handler: async (response) => {
          setPaymentResponse(response);
          console.log("Payment successful:", response);
          console.log(response.razorpay_payment_id);

          // const transactionId = generateTransactionId();

          const transactionId = response.razorpay_payment_id;

          //console.log(transactionId);
          try {
            let updateResponse;
            if (response.razorpay_payment_id) {
              const sub_id = planId;
              let apiUrl, emailUrl;
              if (sub_id.startsWith("SPP")) {
                apiUrl = `http://3.27.116.137:3000/updateparentplan?sub_id=${sub_id}`;
                emailUrl = `http://3.27.116.137:3000/parentemail?sub_id=${sub_id}`;
              } else if (sub_id.startsWith("SPT")) {
                apiUrl = `http://3.27.116.137:3000/updatetutorplan?sub_id=${sub_id}`;
                emailUrl = `http://3.27.116.137:3000/tutoremail?sub_id=${sub_id}`;
              } else if (sub_id.startsWith("SPS")) {
                apiUrl = `http://3.27.116.137:3000/updatestudentplan?sub_id=${sub_id}`;
                emailUrl = `http://3.27.116.137:3000/studentemail?sub_id=${sub_id}`;
              } else {
                console.log("Invalid subscription ID format:", sub_id);
                return;
              }

              const currentDate = new Date();
              const formattedDate = `${
                currentDate.getMonth() + 1
              }/${currentDate.getDate()}/${currentDate.getFullYear()}`;

              updateResponse = await axios.put(apiUrl, {
                sub_id: sub_id,
                tnx_id: transactionId,
                status: "paid",
                date: formattedDate,
              });
              console.log("Transaction ID updated:", updateResponse.data);

              setTimeout(async () => {
                try {
                  const emailResponse = await axios.post(emailUrl);
                  console.log("Email sent:", emailResponse.data);
                } catch (emailError) {
                  console.error("Error in sending email:", emailError);
                }
              }, 2000);
              window.close();
            } else {
              console.log("Payment was not successful, status not updated.");
            }
          } catch (error) {
            console.error("Error updating transaction ID:", error);
          }
        },
        prefill: {
          name: userData.name,
          email: userData.email,
          contact: userData.phone,

          // name: "userData.name",
          // email: "rk@gmail.com",
          // contact: "7708209937",
        },
        notes: {
          address: "Razorpay Corporate Office",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Razorpay error:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="landing-container">
      {!paymentResponse && (
        <div className="logo-container">
          <img src={Logo} alt="Logo" className="logo" />
        </div>
      )}
      {!paymentResponse ? (
        <div className="card">
          <h2>Welcome to Our Platform</h2>
          <p>
            Plan Cost: <span>{userData.amount}</span>{" "}
          </p>
          <p>
            Plan : <span>{userData.planname} </span>{" "}
          </p>
          <p>
            Credits : <span>{userData.credit}</span>{" "}
          </p>
          <button
            className="action-button"
            type="submit"
            onClick={handlePayment}
          >
            Pay Now
          </button>
        </div>
      ) : (
        <div className="payment-details">
          <div className="logo-container">
            <img src={Logo1} alt="Logo" className="logo" />
          </div>
          <p className="success">
            {paymentResponse.razorpay_payment_id
              ? "Payment successful!"
              : "Payment failed."}
          </p>
        </div>
      )}
    </div>
  );
}

export default Razorpay;
