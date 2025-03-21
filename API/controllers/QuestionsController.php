<?php

namespace PP\Controller;

use Exception;
use PP\Classes\Helper;
use PP\Classes\Language;
use PP\Classes\Message;
use PP\Classes\Projects;
use PP\Classes\Questions;
use PP\Classes\Users;
use Slim\Http\Request;
use Slim\Http\Response;
use stdClass;

/**
 * QuestionsController class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class QuestionsController extends BaseController
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
		$Questions = new Questions($this->db);
		$Helper = new Helper($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);

		$results = $Questions->GetAll();

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
		$Questions = new Questions($this->db);
		$Helper = new Helper($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);
		$args = $Helper->ArrayToObject($args);

		$results = $Questions->Get($args);

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
		$Questions = new Questions($this->db);
		$Helper = new Helper($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);
		$args = $Helper->ArrayToObject($args);

		$requiredFields = [
			'id_projects',
			'label',
			'id_questions_types'
		];

		$params->possible_answers = $params->possible_answers ?? [];
		$params->order = $params->order ?? 0;

		foreach ($requiredFields as $field) {
			if (!isset($params->{$field}) || $params->{$field} == "") {
				return Message::WriteMessage(
					400,
					["Message" => $Language->Translate(["phrase" => "Missing {$field}"])],
					$response
				);
			}
		}

		$id = $Questions->Add($params);
		$result = $Questions->Get((object) array("id" => $id));

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
		$Questions = new Questions($this->db);
		$Helper = new Helper($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);
		$args = $Helper->ArrayToObject($args);

		$requiredFields = [
			'id_projects',
			'label',
			'id_questions_types'
		];

		$params->possible_answers = $params->possible_answers ?? [];
		$params->order = $params->order ?? 0;

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
		if ($Questions->Update($params)) {
			return $response->withStatus(204);
		} else {
			return Message::WriteMessage(520, array("Message" => $Language->Translate(array("phrase" => "Unknown error"))), $response);
		}
	}

	/**
	 * Order function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Order(Request $request, Response $response, array $args): Response
	{

		$Language = new Language($this->db);
		$Questions = new Questions($this->db);
		$Helper = new Helper($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);

		if (!isset($params->id_questions) || $params->id_questions == "") {
			return Message::WriteMessage(422, array("Message" => $Language->Translate(array("phrase" => "Missing id_questions array of ids"))), $response);
		}

		if (!isset($params->id_projects) || $params->id_projects == "" || $params->id_projects < 1) {
			return Message::WriteMessage(422, array("Message" => $Language->Translate(array("phrase" => "Missing projects id"))), $response);
		}

		if ($Questions->Order($params)) {
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
		$Questions = new Questions($this->db);
		$Helper = new Helper($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);
		$args = $Helper->ArrayToObject($args);

		$Questions->Delete($args);

		return $response->withStatus(204);
	}
}
