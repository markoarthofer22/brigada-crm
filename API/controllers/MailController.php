<?php

namespace PP\Controller;

use PHPMailer;
use SiteConfig;
use stdClass;

class MailController extends BaseController
{

	public function __construct()
	{
		$this->from_email = $_ENV["SMTP_USERNAME"] && $_ENV["SMTP"] ? $_ENV["SMTP_USERNAME"] : "no-reply@rougemarin.hr";
		$this->from_name = $_ENV["SMTP_USERNAME"] && $_ENV["SMTP"] ? $_ENV["SMTP_USERNAME"] : "no-reply@rougemarin.hr";
		$this->admin_emails = $_ENV["ADMIN_EMAILS"] ? $_ENV["ADMIN_EMAILS"] : null;
		$this->emails = array();
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//// USERS /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	public function Register($params)
	{
		$body = $this->render("./views/mail/Register.php", ["vars" => $params]);
		$this->emails[] = array("name" => $params->ime . ' ' . $params->prezime, "address" => $params->email);

		$data = new stdClass;
		$data->body = $body;
		$data->subject = 'Rougemarin - registracija korisnika ' . $params->ime . ' ' . $params->prezime . ' (' . date("d.m.Y H:i:s") . ')';
		$data->emails = $this->emails;

		return $this->SendMail($data);
	}

	public function ForgotPassword($params)
	{
		$body = $this->render("./views/mail/ForgotPassword.php", ["vars" => $params]);
		$this->emails[] = array("name" => "", "address" => $params->email);

		$data = new stdClass;
		$data->body = $body;
		$data->subject = 'Rougemarin - promjena lozinke ' . $params->email . ' (' . date("d.m.Y H:i:s") . ')';
		$data->emails = $this->emails;

		return $this->SendMail($data);
	}

	public function ChangeEmail($params)
	{
		$body = $this->render("./views/mail/ChangeEmail.php", ["vars" => $params]);
		$this->emails[] = array("name" => $_SESSION["user"]->ime . ' ' . $_SESSION["user"]->prezime, "address" => $params->email);

		$data = new stdClass;
		$data->body = $body;
		$data->subject = 'Rougemarin - promjena emaila ' . $params->email . ' (' . date("d.m.Y H:i:s") . ')';
		$data->emails = $this->emails;

		return $this->SendMail($data);
	}

	private function SendMail($params)
	{

		$mail = new PHPMailer(true);

		$mail->setFrom($this->from_email, $this->from_name);
		$mail->addReplyTo($this->from_email, $this->from_name);

		foreach ($params->emails as $email) {
			$address = $email["address"] ? $email["address"] : "";
			$name = $email["name"] ? $email["name"] : "";
			if ($address && $address != "") {
				$mail->addAddress($address, $name);
			}
		}

		// $mail->addAddress(trim($params->email), trim($params->ime));
		$mail->Subject = $params->subject;

		if ($params->attachFile) {
			$mail->addAttachment($params->attachFile);
		}

		if ($_ENV["SMTP"]) {
			$mail->SMTPOptions = array(
				'ssl' => array(
					'verify_peer' => false,
					'verify_peer_name' => false,
					'allow_self_signed' => true
				)
			);

			$mail->isSMTP();
			$mail->Host = $_ENV["SMTP_HOST"];
			$mail->Port = $_ENV["SMTP_PORT"];
			$mail->SMTPAuth = $_ENV["SMTP_AUTH"];
			$mail->Username = $_ENV["SMTP_USERNAME"];
			$mail->Password = $_ENV["SMTP_PASSWORD"];
		}

		$mail->isHTML(true);
		$mail->CharSet = 'UTF-8';
		$mail->Body = $params->body;

		return $mail->send();
	}
}
