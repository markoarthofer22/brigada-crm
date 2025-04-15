<?php

namespace PP\Controller;

use Exception;
use PP\Classes\Helper;
use PP\Classes\Language;
use PP\Classes\Message;
use PP\Classes\Tracking;
use PP\Classes\Users;
use Slim\Http\Request;
use Slim\Http\Response;
use stdClass;

/**
 * TrackingController class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class TrackingController extends BaseController
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
		$Tracking = new Tracking($this->db);
		$Helper = new Helper($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);
		$queryparams = $request->getQueryParams();

		if (!isset($queryparams["id_projects"]) || $queryparams["id_projects"] == "" || $queryparams["id_projects"] < 1) {
			return Message::WriteMessage(422, array("Message" => "Missing project id"), $response);
		}
		$params->id_projects = $queryparams["id_projects"];

		$results = $Tracking->GetAll($params);
		foreach ($results as &$result) {
			$result["answers"] = $Tracking->GetAnswers((object) array("id_tracking" => $result["id_tracking"]));
			$result["zones"] = $Tracking->GetZones((object) array("id_tracking" => $result["id_tracking"]));
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
		$Tracking = new Tracking($this->db);
		$Helper = new Helper($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);
		$args = $Helper->ArrayToObject($args);

		$result = $Tracking->Get($args);
		$result["answers"] = $Tracking->GetAnswers((object) array("id_tracking" => $args->id));
		$result["zones"] = $Tracking->GetZones((object) array("id_tracking" => $args->id));

		return $response->withJson($result, 200);
	}

	/**
	 * StartTracking function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function StartTracking(Request $request, Response $response, array $args): Response
	{

		$Language = new Language($this->db);
		$Tracking = new Tracking($this->db);
		$Helper = new Helper($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);
		$args = $Helper->ArrayToObject($args);

		if (
			(!isset($params->id_projects) || $params->id_projects == "" || $params->id_projects < 1)
		) {
			return Message::WriteMessage(422, array("Message" => $Language->Translate(array("phrase" => "Missing projects id"))), $response);
		}
		$params->data = $params->data ?? [];


		$id = $Tracking->Add($params);
		$result = $Tracking->Get((object) array("id" => $id));

		return $response->withJson($result, 201);
	}

	/**
	 * EndTracking function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function EndTracking(Request $request, Response $response, array $args): Response
	{

		$Language = new Language($this->db);
		$Tracking = new Tracking($this->db);
		$Helper = new Helper($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);
		$args = $Helper->ArrayToObject($args);

		$params->id = $args->id;

		$is_ended = $Tracking->Get($params);
		if ($is_ended["ended_at"] != null) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Tracking already ended"))), $response);
		}

		if ($Tracking->End($params)) {
			$Tracking->EndOpenZones((object)array("id_tracking" => $params->id));
			return $response->withStatus(204);
		} else {
			return Message::WriteMessage(520, array("Message" => $Language->Translate(array("phrase" => "Unknown error"))), $response);
		}
	}

	/**
	 * GetAnswers function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetAnswers(Request $request, Response $response, array $args): Response
	{
		$Tracking = new Tracking($this->db);
		$Helper = new Helper($this->db);
		$Language = new Language($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);
		$args = $Helper->ArrayToObject($args);
		$queryparams = $request->getQueryParams();

		if (!isset($queryparams["id_tracking"]) || $queryparams["id_tracking"] == "" || $queryparams["id_tracking"] < 1) {
			return Message::WriteMessage(422, array("Message" => "Missing tracking id"), $response);
		}
		$params->id_tracking = $queryparams["id_tracking"];

		$is_ended = $Tracking->Get((object) array("id" => $params->id_tracking));
		if ($is_ended["ended_at"] != null) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Tracking already ended"))), $response);
		}

		$results = $Tracking->GetAnswers($params);

		return $response->withJson(array("results" => $results), 200);
	}

	/**
	 * GetAnswer function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetAnswer(Request $request, Response $response, array $args): Response
	{
		$Tracking = new Tracking($this->db);
		$Helper = new Helper($this->db);
		$Language = new Language($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);
		$args = $Helper->ArrayToObject($args);

		$result = $Tracking->GetAnswer($args);

		$is_ended = $Tracking->Get((object) array("id" => $result["id_tracking"]));
		if ($is_ended["ended_at"] != null) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Tracking already ended"))), $response);
		}

		return $response->withJson($result, 200);
	}

	/**
	 * AddAnswer function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function AddAnswer(Request $request, Response $response, array $args): Response
	{
		$Language = new Language($this->db);
		$Tracking = new Tracking($this->db);
		$Helper = new Helper($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);
		$args = $Helper->ArrayToObject($args);

		$is_ended = $Tracking->Get(((object) array("id" => $params->id_tracking)));
		if ($is_ended["ended_at"] != null) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Tracking already ended"))), $response);
		}

		$requiredFields = [
			"id_tracking",
			"id_projects",
			"id_questions",
			"question",
			"answer",
			"order"
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

		$is_ended = $Tracking->Get((object) array("id" => $params->id_tracking));
		if ($is_ended["ended_at"] != null) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Tracking already ended"))), $response);
		}

		$id = $Tracking->AddAnswer($params);
		if ($id == 0) {
			return Message::WriteMessage(409, array("Message" => $Language->Translate(array("phrase" => "Question already answered"))), $response);
		}
		$result = $Tracking->GetAnswer((object) array("id" => $id));

		return $response->withJson($result, 201);
	}

	/**
	 * UpdateAnswer function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function UpdateAnswer(Request $request, Response $response, array $args): Response
	{

		$Language = new Language($this->db);
		$Tracking = new Tracking($this->db);
		$Helper = new Helper($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);
		$args = $Helper->ArrayToObject($args);

		$is_ended = $Tracking->Get($args);
		if ($is_ended["ended_at"] != null) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Tracking already ended"))), $response);
		}

		$requiredFields = [
			"id_tracking",
			"id_projects",
			"id_questions",
			"question",
			"answer",
			"order"
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

		$is_ended = $Tracking->Get((object) array("id" => $params->id_tracking));
		if ($is_ended["ended_at"] != null) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Tracking already ended"))), $response);
		}

		$params->id = $args->id;
		if ($Tracking->UpdateAnswer($params)) {
			return $response->withStatus(204);
		} else {
			return Message::WriteMessage(520, array("Message" => $Language->Translate(array("phrase" => "Unknown error"))), $response);
		}
	}


	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// ZONES /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * GetZones function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetZones(Request $request, Response $response, array $args): Response
	{
		$Tracking = new Tracking($this->db);
		$Helper = new Helper($this->db);
		$Language = new Language($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);
		$args = $Helper->ArrayToObject($args);
		$queryparams = $request->getQueryParams();

		if (!$queryparams["id_tracking"]) {
			return Message::WriteMessage(422, array("Message" => $Language->Translate(array("phrase" => "Missing id_tracking"))), $response);
		}
		$params->id_tracking = $queryparams["id_tracking"];

		$is_ended = $Tracking->Get((object) array("id" => $params->id_tracking));
		if ($is_ended["ended_at"] != null) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Tracking already ended"))), $response);
		}

		$results = $Tracking->GetZones($params);
		foreach ($results as &$result) {
			$result["answers"] = $Tracking->GetAnswers((object) array("id_tracking" => $params->id_tracking, "id_zones" => $result["id_zones"]));
		}

		return $response->withJson(array("results" => $results), 200);
	}

	/**
	 * GetZone function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetZone(Request $request, Response $response, array $args): Response
	{
		$Tracking = new Tracking($this->db);
		$Helper = new Helper($this->db);
		$Language = new Language($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);
		$args = $Helper->ArrayToObject($args);

		$result = $Tracking->GetZone($args);

		$is_ended = $Tracking->Get((object) array("id" => $result["id_tracking"]));
		if ($is_ended["ended_at"] != null) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Tracking already ended"))), $response);
		}

		$result["answers"] = $Tracking->GetAnswers((object) array("id_tracking" => $result["id_tracking"], "id_zones" => $result["id_zones"]));

		return $response->withJson($result, 200);
	}

	/**
	 * StartZone function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function StartZone(Request $request, Response $response, array $args): Response
	{
		$Language = new Language($this->db);
		$Tracking = new Tracking($this->db);
		$Helper = new Helper($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);
		$args = $Helper->ArrayToObject($args);

		$requiredFields = [
			"id_tracking",
			"id_projects",
			"id_zones",
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

		$is_tracking_ended = $Tracking->Get(((object) array("id" => $params->id_tracking)));
		if ($is_tracking_ended["ended_at"] != null) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Tracking already ended"))), $response);
		}

		$zone_already_started = $Tracking->CheckZoneStarted($params);
		if ($zone_already_started) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Zone already started"))), $response);
		}

		$Tracking->EndOpenZones($params);
		$id = $Tracking->StartZone($params);
		$result = $Tracking->GetZone((object) array("id" => $id));

		return $response->withJson($result, 201);
	}

	/**
	 * EndZone function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function EndZone(Request $request, Response $response, array $args): Response
	{

		$Language = new Language($this->db);
		$Tracking = new Tracking($this->db);
		$Helper = new Helper($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);
		$args = $Helper->ArrayToObject($args);

		$is_tracking_ended = $Tracking->Get($args);
		if ($is_tracking_ended["ended_at"] != null) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Tracking already ended"))), $response);
		}

		$is_zone_ended = $Tracking->GetZone($args);
		if ($is_zone_ended["ended_at"] != null) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Zone already ended"))), $response);
		}

		$params->id = $args->id;
		if ($Tracking->EndZone($params)) {
			return $response->withStatus(204);
		} else {
			return Message::WriteMessage(520, array("Message" => $Language->Translate(array("phrase" => "Unknown error"))), $response);
		}
	}
}
