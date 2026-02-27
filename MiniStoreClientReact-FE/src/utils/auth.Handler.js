export const handleRoleRedirection = (data, navigate) => {
  console.log("Handling Role Redirection with data:", data);
  const roleName = data.userInfo?.RoleName;
  console.log("Detected RoleName:", roleName);
  const token = data.accessToken;

  const validRoles = ['Admin', 'Manager', 'Staff'];

  if (!roleName || !validRoles.includes(roleName)) {
    alert("Quyền truy cập bị từ chối! Role không hợp lệ.");
    localStorage.removeItem('token');
    return;
  }

  localStorage.setItem('token', token);

  const routeMap = {
    'Admin': '/admin',
    'Manager': '/manager',
    'Staff': '/staff'
  };

  navigate(routeMap[roleName]);
};