<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $to = "Mail@PrimeAutoRepairCenter.com";
    $subject = "New Appointment Request";

    $name = htmlspecialchars($_POST["name"]);
    $email = htmlspecialchars($_POST["email"]);
    $phone = htmlspecialchars($_POST["phone"]);
    $service = htmlspecialchars($_POST["service"]);
    $message = htmlspecialchars($_POST["message"]);

    $body = "You have received a new appointment request:\n\n";
    $body .= "Name: $name\n";
    $body .= "Email: $email\n";
    $body .= "Phone: $phone\n";
    $body .= "Service: $service\n";
    $body .= "Message: $message\n";

    $headers = "From: $email";

    if (mail($to, $subject, $body, $headers)) {
        echo "Thank you! Your appointment request has been sent successfully.";
    } else {
        echo "Sorry, there was an error sending your request. Please try again later.";
    }
} else {
    echo "Invalid request method.";
}
?>