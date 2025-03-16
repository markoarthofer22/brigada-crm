<?php

namespace PP\Controller;

use Exception;
use PP\Classes\Helper;
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

	/**
	 * __construct function
	 *
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __construct()
	{
		parent::__construct();
		$this->folder = "/files/projects";
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

		return $response->withJson($results, 200);
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
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Missing name"))), $response);
		}

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
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Missing name"))), $response);
		}

		try {
			$Projects->DeleteImage($args->id);
		} catch (Exception $e) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => $e->getMessage()))), $response);
		}
		if (isset($params->image)) {
			try {
				$image_name = $Projects->UploadImage($params->image);
			} catch (Exception $e) {
				return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => $e->getMessage()))), $response);
			}
		}

		unset($params->image);
		$params->data->image = $image_name;
		$params->id = $args->id;
		if ($Projects->Update($params)) {
			return $response->withStatus(204);
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

		return $response->withStatus(204);
	}
}
