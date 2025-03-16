<!-- HTML MAIL -->
<!DOCTYPE html>
<html>

<head>
	<title>Kontakt upit - www.cvijetarkadija.hr </title>
	<meta charset="utf-8">
	<meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
</head>

<body>
	<!-- DEFINE CSS HERE -->
	<style type="text/css">
		body {
			margin: 0;
			padding: 20px;
			font-family: Helvetica, Arial, sans-serif;
			font-size: 14px;
			background-color: #F9F9F9;
		}

		h1 {
			margin: 0 0 15px 0;
			color: #0066A2;
		}

		ul {
			list-style: none;
			padding: 0;
			margin: 0 0 20px 0;
		}

		ul li {
			margin: 0;
			padding: 0;
		}

		.title {
			margin: 0;
			padding: 0;
		}

		.wrapper {
			position: relative;
			width: 100%;
			padding: 20px 0;
		}

		.wrap {
			max-width: 600px;
			width: 100%;
			margin: 0 auto;
		}

		.content {
			padding: 20px;

			border: 1px solid #F1F1F1;
			border-radius: 8px;
			background-color: #FFF;
		}

		.footer {}

		.disclaimer {
			font-size: 12px;
			color: #8C8C8C;
		}

		table {
			width: 100%;
			border-spacing: 0;
			border-collapse: collapse;
		}

		table td {
			padding: 8px;
			border-top: 1px solid #ddd;
		}

		ul.passengers {
			margin-bottom: 20px;
			overflow: hidden;
		}

		ul.passengers li {
			float: left;
			margin-right: 10px;
		}

		.logo {
			max-width: 200px;
			margin-bottom: 20px;
		}
	</style>

	<div class="wrapper">

		<div class="wrap">
			<!-- <img class="logo" src="https://b2b.goadriatica.com/assets/logo.svg" /> -->
		</div>

		<div class="wrap">
			<h1 class="title">Kontakt upit</h1>
			<!-- <h4>Upit s web stranice www.atlas-kongresi.com</h4> -->
		</div>

		<div class="wrap content">

			<h3>Korisnik</h3>
			<table>
				<tr>
					<td>Ime i prezime</td>
					<td><?= $params["name"] ?></td>
				</tr>
				<tr>
					<td>E-mail</td>
					<td><?= $params["mail"] ?></td>
				</tr>
			</table>
			<div>
				<h3>Upit</h3>
				<div><?= $params["message"] ?></div>
			</div>

		</div>

		<div class="wrap footer">
			<h4>Disclaimer</h4>
			<p class="disclaimer">This email is a request from www.rougemarin.hr, if you received this mail by accident please ignore it.</p>
		</div>
	</div>

</body>

</html>