import { useContext, useState } from "react";
import { UserContext } from "contexts/UserContext";
import "./Profile.scss";
import { UserDataContext } from "contexts/UserDataContext";


const FriendsListDiv = () => {
	return <div className="sub friendsList">
		<h5>Friends</h5>
		<div className="profilesIcons">
			<div className="profile-left-sec">
				<a className="profile btn-floating btn-medium waves-effect waves-light green"></a>
				<a className="profile btn-floating btn-medium  waves-effect waves-light green"></a>
				<a className="profile btn-floating btn-medium  waves-effect waves-light green"></a>
				<a className="profile btn-floating btn-medium  waves-effect waves-light green"></a>
				<a className="profile btn-floating btn-medium  waves-effect waves-light green"></a>
				<a className="profile btn-floating btn-medium  waves-effect waves-light green"></a>
			</div>

			<div className="more"><span>M</span></div>
		</div>
	</div>
}

const Button = ({ buttonText, toggleFunc }) => {
	return <a className="waves-effect waves-light btn" onClick={toggleFunc}>{buttonText}</a>
}

const Profile = () => {
	// fire auth data
	const user = useContext(UserContext)
	// firebase data
	
	const userData = useContext(UserDataContext)
	console.log(user)
	console.log(userData)

	const [editBtn, setEditBtn] = useState(true)
	const [inpBtn,setInpBtn] = useState(true)

	console.log("input val : "+inpBtn)
	function enableEditInputs(){
		console.log("edit is running")
		setInpBtn(!inpBtn)
	}

	function updateInfo() {
		console.log("save is running")
		setInpBtn(!inpBtn)
	}

	function toggleEditBtn() {
		setEditBtn(!editBtn)	
		editBtn ? enableEditInputs()  : updateInfo();
	}

	return (
		<>
			{/* {user?.displayName} */}
			<div className="container">
				<div className="row">
					<div className="col s12">
						<div className="main-card" >
							<div className="banner col s12">
								<div className="btn-wrapper">
									<a className="circle custom-size">Profile</a>
									{
										(editBtn) ?
											<Button toggleFunc={toggleEditBtn} buttonText="Edit" />
											: <Button toggleFunc={toggleEditBtn} buttonText="Save" />
									}

								</div>
							</div>
							<div className="sub-card">
								<div className="sub">Display Name :<input className="col s8 white-text subInp" defaultValue={userData.displayName} disabled={inpBtn}/></div>
								<div className="sub">Email Id : <input className="col s8 white-text subInp" defaultValue={userData.email} disabled={inpBtn}/></div>
								<div className="sub">Phone : <input className="col s8 white-text subInp" defaultValue={userData.phoneNumber} disabled={inpBtn}/></div>
								<FriendsListDiv />
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export { Profile };
