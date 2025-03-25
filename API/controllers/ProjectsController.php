<?php

namespace PP\Controller;

use Exception;
use PP\Classes\Helper;
use PP\Classes\Images;
use PP\Classes\Language;
use PP\Classes\Message;
use PP\Classes\Projects;
use PP\Classes\Questions;
use PP\Classes\Users;
use PP\Classes\Zones;
use Slim\Http\Request;
use Slim\Http\Response;
use stdClass;

/**
 * ProjectsController class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class ProjectsController extends BaseController
{

	protected $folder;
	protected $allowedTypes;

	/**
	 * __construct function
	 *
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __construct()
	{
		parent::__construct();
		$this->folder = "/files/projects";
		$this->allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
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
		$Projects = new Projects($this->db);
		$Helper = new Helper($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);

		$results = $Projects->GetAll();

		return $response->withJson(array("results" => $results), 200);
	}

	/**
	 * Get function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Get(Request $request, Response $response, array $args): Response
	{
		$Projects = new Projects($this->db);
		$Questions = new Questions($this->db);
		$Zones = new Zones($this->db);
		$Helper = new Helper($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);
		$args = $Helper->ArrayToObject($args);

		$result = $Projects->Get($args);
		$result["questions"] = $Questions->GetForProject($args);
		$result["zones"] = $Zones->GetForProject($args);
		foreach ($result["zones"] as &$zone) {
			$zone["questions"] = $Questions->GetForZone((object) array("id" => $zone["id_zones"]));
		}
		$result["images"] = $Projects->GetImages($args);
		$result["path"] = $_ENV["DOMAIN"] . $this->folder;

		return $response->withJson($result, 200);
	}

	/**
	 * Add function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Add(Request $request, Response $response, array $args): Response
	{

		$Language = new Language($this->db);
		$Projects = new Projects($this->db);
		$Helper = new Helper($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);
		$args = $Helper->ArrayToObject($args);

		if (!isset($params->data->name) || $params->data->name == "") {
			return Message::WriteMessage(422, array("Message" => $Language->Translate(array("phrase" => "Missing name"))), $response);
		}

		$params->data->active = $params->data->active ?: 0;

		$id = $Projects->Add($params);
		$result = $Projects->Get((object) array("id" => $id));

		return $response->withJson($result, 201);
	}

	/**
	 * Update function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Update(Request $request, Response $response, array $args): Response
	{

		$Language = new Language($this->db);
		$Projects = new Projects($this->db);
		$Helper = new Helper($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);
		$args = $Helper->ArrayToObject($args);

		if (!isset($params->data->name) || $params->data->name == "") {
			return Message::WriteMessage(422, array("Message" => $Language->Translate(array("phrase" => "Missing name"))), $response);
		}

		$params->data->active = $params->data->active ?: 0;
		$params->id = $args->id;

		if ($Projects->Update($params)) {
			return $response->withJson([], 204);;
		} else {
			return Message::WriteMessage(520, array("Message" => $Language->Translate(array("phrase" => "Unknown error"))), $response);
		}
	}

	/**
	 * Delete function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Delete(Request $request, Response $response, array $args): Response
	{

		$Language = new Language($this->db);
		$Projects = new Projects($this->db);
		$Helper = new Helper($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);
		$args = $Helper->ArrayToObject($args);

		$Projects->Delete($args);

		return $response->withJson([], 204);;
	}

	/**
	 * UploadImage function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function UploadImage(Request $request, Response $response, array $args): Response
	{
		$Language = new Language($this->db);
		$Projects = new Projects($this->db);
		$Images = new Images($this->db);
		$Helper = new Helper($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);
		$args = $Helper->ArrayToObject($args);
		$files = $request->getUploadedFiles();

		if (empty($files)) {
			return Message::WriteMessage(422, array("Message" => $Language->Translate(array("phrase" => "Missing file"))), $response);
		}

		// Get only the first uploaded file
		$firstFile = reset($files);

		if ($firstFile->getError() !== UPLOAD_ERR_OK) {
			return Message::WriteMessage(422, array("Message" => $Language->Translate(array("phrase" => "Error uploading file"))), $response);
		}

		$params = array(
			"type" => $firstFile->getClientMediaType(),
			"temp_file" => $firstFile->file,
			"file_name" => $firstFile->getClientFilename(),
			"size" => $firstFile->getSize(),
			"error" => $firstFile->getError(),
			"is_uploaded" => is_uploaded_file($firstFile->file),
			"extension" => pathinfo($firstFile->getClientFilename(), PATHINFO_EXTENSION),
			"original_name" => pathinfo($firstFile->getClientFilename(), PATHINFO_FILENAME),
			"uploaded_at" => date('c')
		);

		if (!in_array($params["type"], $this->allowedTypes)) {
			return Message::WriteMessage(422, array("Message" => $Language->Translate(array("phrase" => "Unsupported file type: {$params["type"]}"))), $response);
		}

		$dimensions = @getimagesize($firstFile->file);
		if ($dimensions) {
			$params["width"] = $dimensions[0];
			$params["height"] = $dimensions[1];
			$params["mime"] = $dimensions["mime"] ?? null;
		}

		$image = $Images->Upload($params);
		$Projects->ConnectProjectsImages((object)["id_projects" => $args->id, "id_images" => $image["id_images"]]);
		return $response->withJson(array("name" => $image["name"], "id_images" => $image["id_images"]), 200);
	}

	/**
	 * DeleteImage function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function DeleteImage(Request $request, Response $response, array $args): Response
	{
		$Language = new Language($this->db);
		$Projects = new Projects($this->db);
		$Images = new Images($this->db);
		$Helper = new Helper($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);
		$args = $Helper->ArrayToObject($args);

		$image = $Images->Delete($args->id_images);
		$Projects->DisconnectProjectsImages((object)["id_projects" => $args->id, "id_images" => $args->id_images]);
		return $response->withJson([], 204);;
	}
}
