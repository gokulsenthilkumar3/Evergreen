<?php 
require_once 'php_action/db_connect.php';

session_start();

if(isset($_SESSION['userId'])) {
	header('location:dashboard.php');	
}

$errors = array();

if($_POST) {		

	$username = $_POST['username'];
	$password = $_POST['password'];

	if(empty($username) || empty($password)) {
		if($username == "") {
			$errors[] = "Username is required";
		} 

		if($password == "") {
			$errors[] = "Password is required";
		}
	} else {
$sql="select * from users where username='$username' and password='$password'; ";
$result=mysqli_query($connect,$sql);
$count=mysqli_num_rows($result);
$row=mysqli_fetch_array($result);

if ($count == 1) { 
	   $_SESSION['userId']=$row['username'];
		header("location:dashboard.php");
}
 else {
	?><script type="text/javascript">
		alert("Wrong details!!");
		window.location= "index.php";
	</script>
<?php
}

	} // /else not empty username // password
	
} // /if $_POST
?>

<!DOCTYPE html>
<html>
<head>
	<title>Weave — Stock Management System</title>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="description" content="Weave Stock Management System — Manage your inventory, orders, and reports.">

	<!-- bootstrap -->
	<link rel="stylesheet" href="assests/bootstrap/css/bootstrap.min.css">
	<!-- bootstrap theme-->
	<link rel="stylesheet" href="assests/bootstrap/css/bootstrap-theme.min.css">
	<!-- font awesome -->
	<link rel="stylesheet" href="assests/font-awesome/css/font-awesome.min.css">

  <!-- custom css -->
  <link rel="stylesheet" href="custom/css/custom.css">

  <style>
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
    }
    .login-card {
      width: 100%;
      max-width: 420px;
      background: var(--bg-card);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-xl);
      box-shadow: 0 16px 64px rgba(0,0,0,.4), var(--shadow-glow);
      overflow: hidden;
      animation: fadeUp .6s ease-out;
    }
    .login-header {
      background: linear-gradient(135deg, var(--primary), var(--accent));
      padding: 40px 32px 32px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .login-header::after {
      content: '';
      position: absolute;
      top: -60%;
      left: -40%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,.06) 0%, transparent 50%);
      animation: cardShine 8s ease-in-out infinite;
    }
    .login-icon {
      width: 64px;
      height: 64px;
      background: rgba(255,255,255,.18);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      font-size: 28px;
      color: #fff;
      backdrop-filter: blur(8px);
      position: relative;
      z-index: 1;
    }
    .login-header h2 {
      color: #fff;
      font-weight: 800;
      font-size: 22px;
      margin: 0 0 4px;
      position: relative;
      z-index: 1;
    }
    .login-header p {
      color: rgba(255,255,255,.7);
      font-size: 13px;
      font-weight: 400;
      margin: 0;
      position: relative;
      z-index: 1;
    }
    .login-body {
      padding: 32px;
    }
    .login-body .form-group {
      margin-bottom: 20px;
    }
    .login-body label {
      display: block;
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .8px;
      margin-bottom: 6px;
    }
    .login-body .form-control {
      width: 100%;
      padding: 14px 16px !important;
      font-size: 14px;
    }
    .login-btn {
      width: 100%;
      padding: 14px !important;
      font-size: 15px !important;
      font-weight: 700 !important;
      margin-top: 8px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark)) !important;
      color: #fff !important;
      border: none !important;
      border-radius: var(--radius-sm) !important;
      box-shadow: 0 4px 16px rgba(108,99,255,.3);
      transition: all .25s ease;
    }
    .login-btn:hover {
      box-shadow: 0 6px 24px rgba(108,99,255,.5);
      transform: translateY(-2px);
    }
    .login-footer {
      text-align: center;
      padding: 0 32px 28px;
      color: var(--text-muted);
      font-size: 12px;
    }
  </style>

  <!-- jquery -->
	<script src="assests/jquery/jquery.min.js"></script>
  <!-- jquery ui -->  
  <link rel="stylesheet" href="assests/jquery-ui/jquery-ui.min.css">
  <script src="assests/jquery-ui/jquery-ui.min.js"></script>

  <!-- bootstrap js -->
	<script src="assests/bootstrap/js/bootstrap.min.js"></script>
</head>
<body>
	<div class="login-wrapper">
		<div class="login-card">
			<div class="login-header">
				<div class="login-icon">
					<i class="glyphicon glyphicon-stats"></i>
				</div>
				<h2>Weave</h2>
				<p>Stock Management System</p>
			</div>
			<div class="login-body">

				<div class="messages">
					<?php if($errors) {
						foreach ($errors as $key => $value) {
							echo '<div class="alert alert-warning" role="alert">
							<i class="glyphicon glyphicon-exclamation-sign"></i>
							'.$value.'</div>';								
							}
						} ?>
				</div>

				<form action="<?php echo $_SERVER['PHP_SELF'] ?>" method="post" id="loginForm">
					<div class="form-group">
						<label for="username">Username</label>
						<input type="text" class="form-control" id="username" name="username" placeholder="Enter your username" autocomplete="off" />
					</div>
					<div class="form-group">
						<label for="password">Password</label>
						<input type="password" class="form-control" id="password" name="password" placeholder="Enter your password" autocomplete="off" />
					</div>
					<button type="submit" class="btn login-btn"> <i class="glyphicon glyphicon-log-in"></i> Sign In</button>
				</form>
			</div>
			<div class="login-footer">
				&copy; <?php echo date('Y'); ?> Weave · All rights reserved
			</div>
		</div>
	</div>
</body>
</html>



	