const Contact = () => {
  return (
    <div style={{ padding: "40px", background: "#111", color: "white" }}>
      <h2>Contact Us</h2>
      
      <p>Email: example@gmail.com</p>
      <p>Phone: +91 XXXXX XXXXX</p>

      <form style={{ marginTop: "20px" }}>
        <input placeholder="Your Name" style={{ display: "block", marginBottom: "10px" }} />
        <input placeholder="Your Email" style={{ display: "block", marginBottom: "10px" }} />
        <textarea placeholder="Message" style={{ display: "block", marginBottom: "10px" }} />
        <button>Send</button>
      </form>
    </div>
  );
};

export default Contact;