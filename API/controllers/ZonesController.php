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
 * ZonesController class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class ZonesController extends BaseController
{

	/**
	 * __construct function
	 *
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __construct()
	{
		parent::__construct();
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
		$Zones = new Zones($this->db);
		$Helper = new Helper($this->db);
		$Questions = new Questions($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);

		$results = $Zones->GetAll();
		foreach ($results as &$result) {
			$result["questions"] = $Questions->GetForZone((object) array("id" => $result["id_zones"]));
		}

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
		$Zones = new Zones($this->db);
		$Helper = new Helper($this->db);
		$Questions = new Questions($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);
		$args = $Helper->ArrayToObject($args);

		$results = $Zones->Get($args);
		$result["questions"] = $Questions->GetForZone($args);

		return $response->withJson($results, 200);
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
		$Zones = new Zones($this->db);
		$Helper = new Helper($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);
		$args = $Helper->ArrayToObject($args);

		$requiredFields = [
			'id_projects',
			'id_images',
			'name',
			'coordinates'
		];

		$params->data = $params->data ?? [];

		foreach ($requiredFields as $field) {
			if (!isset($params->{$field}) || $params->{$field} == "") {
				return Message::WriteMessage(
					400,
					["Message" => $Language->Translate(["phrase" => "Missing {$field}"])],
					$response
				);
			}
		}

		$id = $Zones->Add($params);
		$result = $Zones->Get((object) array("id" => $id));

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
		$Zones = new Zones($this->db);
		$Helper = new Helper($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);
		$args = $Helper->ArrayToObject($args);

		$requiredFields = [
			'id_projects',
			'id_images',
			'name',
			'coordinates'
		];

		$params->data = $params->data ?? [];

		foreach ($requiredFields as $field) {
			if (!isset($params->{$field}) || $params->{$field} == "") {
				return Message::WriteMessage(
					400,
					["Message" => $Language->Translate(["phrase" => "Missing {$field}"])],
					$response
				);
			}
		}

		$params->id = $args->id;
		if ($Zones->Update($params)) {
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
		$Zones = new Zones($this->db);
		$Helper = new Helper($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);
		$args = $Helper->ArrayToObject($args);

		$Zones->Delete($args);

		return $response->withStatus(204);
	}
}
