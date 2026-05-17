<?php
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    exit;
}

if (!empty($_POST["website"])) {
    echo "error";
    exit;
}

function clean_input($data) {
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

$to = "info@cetinboya.net";

if (!empty($_POST["firma-adi"])) {
    $firma_adi      = clean_input($_POST["firma-adi"]);
    $faaliyet_alani = clean_input($_POST["faaliyet-alanı"] ?? "");
    $ad_soyadi      = clean_input($_POST["ad-soyadi"]);
    $email          = clean_input($_POST["email"]);
    $message        = clean_input($_POST["sirketMessage"] ?? "");

    $subject = "Yeni Şirket Mesajı: $firma_adi";

    $body = "Firma Adı: $firma_adi\n"
          . "Faaliyet Alanı: $faaliyet_alani\n"
          . "Yetkili Kişi: $ad_soyadi\n"
          . "E-posta: $email\n\n"
          . "Mesaj:\n$message";

} else {
    $ad_soyadi  = clean_input($_POST["ad-soyadi"]);
    $email      = clean_input($_POST["email"]);
    $tel_numara = clean_input($_POST["tel-numara"] ?? "");
    $message    = clean_input($_POST["sahisMessage"] ?? "");

    $subject = "Yeni Bireysel Mesaj: $ad_soyadi";

    $body = "Ad Soyad: $ad_soyadi\n"
          . "E-posta: $email\n"
          . "Telefon: $tel_numara\n\n"
          . "Mesaj:\n$message";
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo "error";
    exit;
}

if (empty($ad_soyadi) || empty($email) || empty($message)) {
    echo "error";
    exit;
}

$headers  = "From: $email\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

if (mail($to, $subject, $body, $headers)) {
    echo "success";
} else {
    error_log("Mail failed. Data: " . json_encode($_POST));
    echo "error";
}
?>