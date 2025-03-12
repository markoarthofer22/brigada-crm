<?php

namespace PP\Classes;

use Exception;
use PDO;
use stdClass;

/**
 * Users class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class Users
{

	protected $database;
	protected $ldapServer;
	protected $ldapDomain;

	/**
	 * __construct function
	 *
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __construct(PDO $db)
	{
		$this->database = $db;
		$this->ldapServer = 'ldap://10.63.1.22/';
		$this->ldapDomain = 'dpd.hr';
	}


	/**
	 * Login function
	 *
	 * @param object $params
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Login(object $params): array
	{

		$Helper = new Helper($this->database);
		$ip_address = $Helper->get_client_ip();
		$ldapConn = ldap_connect($this->ldapServer) or die("Unable to connect to LDAP server.");

		// print_r($params);
		// exit;

		ldap_set_option($ldapConn, LDAP_OPT_PROTOCOL_VERSION, 3);
		ldap_set_option($ldapConn, LDAP_OPT_REFERRALS, 0);

		$ldapBind = ldap_bind($ldapConn, "{$params->username}@{$this->ldapDomain}", $params->password);
		if ($ldapBind) {
			// echo "2";
			$result = ldap_search($ldapConn, "DC=dpd,DC=hr", "(&(objectClass=user)(samaccountname={$params->username})(memberof=CN=cpm_user,OU=CPM,OU=Groups,DC=dpd,DC=hr))", ['displayname']);
			$data = ldap_get_entries($ldapConn, $result);

			// print_r($data);

			$isCPMUser = $data['count'] > 0;
			if ($isCPMUser) {
				$realName = $data[0]['displayname'][0];
			}

			$result = ldap_search($ldapConn, "DC=dpd,DC=hr", "(&(objectClass=user)(samaccountname={$params->username})(memberof=CN=cpm_upload,OU=CPM,OU=Groups,DC=dpd,DC=hr))", ['displayname']);
			$data = ldap_get_entries($ldapConn, $result);

			$canUpload = $data['count'] > 0;

			$result = ldap_search($ldapConn, "DC=dpd,DC=hr", "(&(objectClass=user)(samaccountname={$params->username})(memberof=CN=cpm_settings,OU=CPM,OU=Groups,DC=dpd,DC=hr))", ['displayname']);
			$data = ldap_get_entries($ldapConn, $result);

			$canSettings = $data['count'] > 0;

			$sql = "SELECT id FROM public.userlist WHERE username = :USERNAME LIMIT 1";
			$stmt = $this->database->prepare($sql);
			$stmt->bindParam(':USERNAME', $params->username);
			$stmt->execute();
			$result = $stmt->fetchObject();

			// print_r($result);
			// exit;

			if (!$result->id) {
				$sql = "INSERT INTO public.userlist (username, realname) VALUES (:USERNAME, :REALNAME) RETURNING id";
				$stmt = $this->database->prepare($sql);
				$stmt->bindParam(':USERNAME', $params->username);
				$stmt->bindParam(':REALNAME', $realName);
				$stmt->execute();
				$result = $stmt->fetchObject();
			}
			$userId = $result->id;

			$_SESSION["user"]['userId'] = $userId;
			$_SESSION["user"]['userName'] = $params->username;
			$_SESSION["user"]['realName'] = $realName;
			$_SESSION["user"]['isCPMUser'] = $isCPMUser;
			$_SESSION["user"]['canUpload'] = $canUpload;
			$_SESSION["user"]['canSettings'] = $canSettings;
		}

		return $_SESSION["user"] ? $_SESSION["user"] : array();
	}


	/**
	 * Logout function
	 *
	 * @return boolean
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Logout(): bool
	{
		unset($_SESSION["user"]);
		return true;
	}


	/**
	 * isUserLogedIn function
	 *
	 * @return boolean
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function isUserLogedIn(): bool
	{
		return isset($_SESSION["user"]) && $_SESSION["user"] != null ? true : false;
	}
}
