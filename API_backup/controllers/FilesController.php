<?php

namespace PP\Controller;

use PP\Classes\Helper;
use DirectoryIterator;
use PP\Classes\Language;
use PP\Classes\Message;
use Slim\Http\Request;
use Slim\Http\Response;
use stdClass;

/**
 * FilesController class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class FilesController extends BaseController
{

	protected $folders;
	protected $upload_folder;
	protected $download_folder;

	/**
	 * __construct function
	 *
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __construct()
	{
		parent::__construct();
		$this->folders = array("AirExpress", "CreditNotes", "ICS", "ICS_clearing", "ICS_oversize", "ICS_weight", "Linehaul");
		$this->upload_folder = "../files/upload";
		$this->download_folder = "../files/download";
	}

	private function isJson($string)
	{
		json_decode($string);
		return json_last_error() === JSON_ERROR_NONE;
	}

	/**
	 * __invoke function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __invoke(Request $request, Response $response, array $args): Response
	{
		$Helper = new Helper($this->db);

		// echo "<pre>";

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		if (isset($params->query->month) && !empty($params->query->month) && preg_match('/^\d{4}-\d{2}$/', $params->query->month)) {
			$month = $params->query->month;
		} else {
			$month = date("Y-m");
		}

		if (!is_dir($this->upload_folder)) {
			mkdir($this->upload_folder, 0777, true);
			foreach ($this->folders as $folder) {
				if (!is_dir($this->upload_folder . "/" . $folder)) {
					mkdir($this->upload_folder . "/" . $folder, 0777, true);
				}
			}
		}

		$subfolders = [];
		// echo $this->upload_folder . "<br>";
		foreach (new DirectoryIterator($this->upload_folder) as $fileInfo) {
			if ($fileInfo->isDir() && !$fileInfo->isDot()) {
				$main_subfolder_name = $fileInfo->getBasename();
				// print_r($fileInfo);
				// $targetDir = $this->upload_folder . "/" . $fileInfo->getBasename() . "/" . $month;
				$targetDir = $this->upload_folder . "/" . $fileInfo->getBasename();

				if (!is_dir($targetDir)) {
					mkdir($targetDir, 0777, true);
				}

				$subfolder_content = "";
				foreach (new DirectoryIterator($targetDir) as $fileInfoSub) {
					// print_r($fileInfoSub->getBasename());
					// echo $fileInfoSub->isFile() . " : " . pathinfo($fileInfoSub->getBasename(), PATHINFO_FILENAME) . " : " . $month . "<br>";
					// echo "=> " . $targetDir . " --> " . $fileInfoSub->getBasename() . "-" . pathinfo($fileInfoSub->getBasename(), PATHINFO_FILENAME) . "<br>";
					if ($fileInfoSub->isFile() && pathinfo($fileInfoSub->getBasename(), PATHINFO_FILENAME) == $month) {
						$subfolder_content = $fileInfoSub->getBasename();
						// 	// $test = 2;
						// 	// echo $targetDir . " --> " . $subfolder_content . "<br>";
					}
				}
				// echo $targetDir . "<br>";
				// echo $subfolder_content;
				// echo "<hr>";
				// echo $test;

				// echo "<hr>";
				// echo "<hr>";
				// print_r($targetDir);
				// echo "<hr>";
				// print_r($subfolders);

				$subfolders[$main_subfolder_name] = $subfolder_content;
			}
		}
		// exit;
		$res = new stdClass;
		$res->folders = $subfolders;

		return $response->withJson($res, 200);
	}

	/**
	 * Upload function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Upload(Request $request, Response $response, array $args): Response
	{
		$Helper = new Helper($this->db);
		$Language = new Language($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		if (!isset($params->month) || empty($params->month) || !preg_match('/^\d{4}-\d{2}$/', $params->month)) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Month missing or in wrong format"))), $response);
		}

		if (!isset($params->folder) || empty($params->folder)) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Folder missing"))), $response);
		}

		if (!isset($_FILES["payload"]) || empty($_FILES["payload"])) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Upload payload missing"))), $response);
		}

		// $targetDir = $this->upload_folder . "/" . $params->folder . "/" . $params->month;
		$targetDir = $this->upload_folder . "/" . $params->folder;
		if (!file_exists($targetDir)) {
			mkdir($targetDir, 0777, true); // Create directory with permissions
		}
		$extension = pathinfo($_FILES['payload']['name'], PATHINFO_EXTENSION);
		$newFilename = $params->month . '.' . $extension;
		$targetFile = $targetDir . '/' . $newFilename;

		// echo "<pre>";
		// print_r($params);
		// echo "<hr>";
		// print_r($targetDir);
		// echo "<hr>";
		// print_r($newFilename);
		// echo "<hr>";
		// print_r($targetFile);
		// echo "<hr>";
		// print_r($_FILES);
		// exit;

		move_uploaded_file($_FILES['payload']['tmp_name'], $targetFile);

		$res = new stdClass;
		$res->uploaded = true;

		return $response->withJson($res, 200);
	}


	/**
	 * Upload function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Delete(Request $request, Response $response, array $args): Response
	{
		$Helper = new Helper($this->db);
		$Language = new Language($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		if (!isset($params->month) || empty($params->month) || !preg_match('/^\d{4}-\d{2}$/', $params->month)) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Month missing or in wrong format"))), $response);
		}

		if (!isset($params->folder) || empty($params->folder)) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Folder missing"))), $response);
		}

		if (!isset($params->file) || empty($params->file)) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "File missing"))), $response);
		}

		// $targetDir = $this->upload_folder . "/" . $params->folder . "/" . $params->month;
		$targetDir = $this->upload_folder . "/" . $params->folder;

		if (file_exists($targetDir . "/" . $params->file)) {
			unlink($targetDir . "/" . $params->file);
		} else {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "File not found"))), $response);
		}


		$res = new stdClass;
		$res->deleted = true;

		return $response->withJson($res, 200);
	}

	/**
	 * Download function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Download(Request $request, Response $response, array $args): Response
	{
		$Helper = new Helper($this->db);
		$Language = new Language($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		if (!is_dir($this->download_folder)) {
			mkdir($this->download_folder, 0777, true);
		}



		// if (isset($params->query->folder) && !in_array($params->query->folder, $this->folders)) {
		// 	return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Folder not found"))), $response);
		// }

		$target_folder = $this->download_folder . "/" . $params->query->folder;

		$folders = array_map('basename', glob($target_folder . '/*', GLOB_ONLYDIR));

		$files = array();
		if (isset($params->query->folder)) {
			$files = array_map('basename', array_filter(glob($target_folder . '/*'), function ($item) {
				return is_file($item); // Ensure the item is a file
			}));
		}

		$result = new stdClass;
		$result->folders = $folders;
		$result->target_folder = $target_folder;
		$result->url = str_replace("../", "https://cpm.dpd.hr/", $target_folder) . "/";
		$result->files = $files;

		return $response->withJson($result, 200);
	}
}
