import { useContext } from "react";
import { UserContext } from "contexts/UserContext";
import "./Profile.scss";
import { UserDataContext } from "contexts/UserDataContext";

const Profile = () => {
	// fire auth data
	const user = useContext(UserContext)
	// firebase data
	const userData = useContext(UserDataContext)
	console.log(user)
	console.log(userData)
	return (
		<>
			{/* {user?.displayName} */}
			<div className="container">
				<div className="row">
					<div className="col s12">
						<div className="main-card" >
							<div className="banner col s12">
								<div className="btn-wrapper">
									<a className="circle  custom-size waves-light"><i className="material-icons hover-text" >Profile</i></a>			
								</div>
							</div>
							<div className="sub-card">
								<div className="sub">Display Name : {userData.displayName}</div>
								<div className="sub">Email Id : {userData.email}</div>
								<div className="sub">Phone : {userData.phoneNumber}</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export { Profile };
