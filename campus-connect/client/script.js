

      $(document).ready(function () {
    $(".test").hide();
    $('.SubforumPage').hide(); // Corrected the selector for SubforumPage
    //$(".Main-Container").hide();
    $('.ReplyPage').hide();
    fetchHomePageForumsData();
    if (isUserLoggedIn()) {
        // User is logged in, show user-related content or perform other actions
        $("#userDropdown").show();
        $(".login_button").hide();
        $(".logout_button").show();
        $(".signup_button").hide();
        
    }
    //Hide userdropdown if User is not logged in.
    if (!isUserLoggedIn()){
        $("#userDropdown").hide();
    }
    //Open's the selected subforum and displays all the posts underneath
    $(document).on('click', '.subforum', function () {
        $(".Main-Container").hide();
        
        const subforumID = $(this).data('subforum-id');
        const subforumName = $(this).find('h4').text();
        getSubforumDetailsAndPosts(subforumID, subforumName);
        $('.SubforumPage').show();
    });

    //Open the Post Page with the replies
    $(document).on('click', '.post', function () {
        $(".SubforumPage").hide();
        
        const PostID = $(this).find('.post-content').data('post-id');

        const PostTitle = $(this).find('h3').text();
        
        fetchRepliesForPost(PostID, PostTitle);
        $('.ReplyPage').show();
    });
    
    // postsContainer is the container where you append posts
    $('.Posts').on('click', '.fas.fa-arrow-up', function () {
        // Get the post ID from the data attribute of the post-content element
        const postID = $(this).closest('.post-content').data('post-id');

        // Make an AJAX request to upvote the post
        $.ajax({
            url: `http://localhost:port/posts/upvote/${postID}`,
            method: 'PATCH',
            success: function (data) {
                // Update the vote count in the UI
                const voteCountElement = $(this).siblings('.vote-section').find('.vote-count');
                voteCountElement.text(data.voteCount); // Assuming your server sends back the updated vote count
            },
            error: function (error) {
                console.error('Failed to upvote post:', error.responseJSON);
            }
        });
    });

    $('.Posts').on('click', '.fas.fa-arrow-down', function () {
        // Get the post ID from the data attribute of the post-content element
        const postID = $(this).closest('.post-content').data('post-id');

        // Make an AJAX request to downvote the post
        $.ajax({
            url: `http://localhost:port/posts/downvote/${postID}`,
            method: 'PATCH',
            success: function (data) {
                // Update the vote count in the UI
                const voteCountElement = $(this).siblings('.vote-section').find('.vote-count');
                voteCountElement.text(data.voteCount); // Assuming your server sends back the updated vote count
            },
            error: function (error) {
                console.error('Failed to downvote post:', error.responseJSON);
            }
        });
    });
    
    // Event listener for the login button
    $(".login_button").on('click', function () {
        openLoginModal();
    });

    // Event listener for the close button
    $(".close").on('click', function () {
        closeLoginModal();
    });

    // Event listener for the logout button
    $(".logout_button").on('click', function () {
        // Add logic to perform logout, e.g., clear localStorage
        localStorage.removeItem('token');
        // Additional logout logic as needed

        // After logout, hide the logout button and show the login button
        $(".logout_button").hide();
        $(".login_button").show();
        $(".signup_button").show();
    });

    // Event listener for the login form submission
    $("#loginForm").on('submit', function (event) {
        event.preventDefault();

        const username = $("#usernamez").val();
        const password = $("#password").val();

        // Perform login using jQuery $.ajax
        $.ajax({
            url: 'http://localhost:3000/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                UserName: username,
                UserPassword: password
            }),
            success: function (data) {
                localStorage.setItem('token', data.token);
                alert('Logged in successfully! Token stored in localStorage');
                //openSuccessModal();
                $(".login_button").hide();
                $(".logout_button").show();
                $(".signup_button").hide();
                closeLoginModal();
            },
            error: function (error) {
                alert('Failed to log in');
                console.error('There was a problem logging in:', error);
            }
        });
    });

    $(".user-button").on('click', function () {
        toggleUserDropdown();
    });

    $('.SubforumPage .create-post-button').on('click', function () {
        // Implement logic to open a modal or navigate to the create post page
        console.log('Create Post button clicked');
    });
    
    // Event listener for delete buttons (delegated to dynamically created elements)
    $('.SubforumPage .Posts').on('click', '.delete-post-button', function (event) {
        event.preventDefault();
        const postID = $(this).closest('.post').data('post-id');
        // Call a function to handle post deletion based on the postID
        deletePost(postID);
    });

});

//Header Logged In User DropDown
function toggleUserDropdown() {
    $("#userDropdownContent").slideToggle();
}
// Login Methods
//Check if User is Logged in
function isUserLoggedIn() {
    const token = localStorage.getItem('token');
    return token !== null; // If the token exists, the user is considered logged in
}
function openLoginModal() {
    $(".overlay").show();
    $("#loginModal").fadeIn(); // Use fadeIn() for a smooth appearance
}

function closeLoginModal() {
    $("#loginModal").fadeOut(); // Use fadeOut() for a smooth disappearance
    $(".overlay").hide();
}
// Login Successful Modal
function openSuccessModal() {
    $("#successModal").fadeIn();
}
// Login function using jQuery $.ajax

///////////////////////////////////////////////////////////////////////////
//Home Page Methods
function fetchHomePageForumsData() {
    var iconClasses = ['fa-solid fa-w','fa-solid fa-terminal','fa-solid fa-calculator','fa-solid fa-music',"fa-solid fa-flask","fa-solid fa-book","fa-solid fa-medical", "fa-solid fa-plane", "fa-solid fa-bowl-food", "fa-solid fa-film"];
    // Make an AJAX request to fetch forum data
    $.ajax({
        url: 'http://localhost:3000/forums',
        method: 'GET',
        success: function (data) {
            // On success, iterate through the data and add subforums to the subforums container
            data.forEach(function (forum, index) {
                // Get the corresponding icon class or use a default if the array is not long enough
                var iconClass = iconClasses[index] || 'fas fa-question';

                // Create a new subforum element
                var newSubforum = $('<div class="subforum" data-subforum-id="' + forum.SubForumID + '"><i class="' + iconClass + '"></i><h4>' + forum.Name + '</h4></div>');                // Append the new subforum to the subforums container
                $(".subforums").append(newSubforum);
            });
        },
        error: function () {
            // Handle error
            console.error('Failed to fetch forum data.');
        }
    });
}
///////////////////////////////////////////////////////////////////////////
//SubForum Page Methods
// Function to get subforum details and posts based on SubForumID
function getSubforumDetailsAndPosts(subforumID,subforumName) {
    $.ajax({
        url: `http://localhost:3000/forums/posts/${subforumID}`,
        method: 'GET',
        success: function (data) {
            // Update the UI with subforum title and posts
            console.log('Subforum Details and Posts:', data);
            updateSubforumPageUI(data,subforumName); // Implement this function to update UI
        },
        error: function (error) {
            console.error('Failed to fetch subforum details and posts:', error.responseJSON);
            // Handle errors or show a user-friendly message
        }
    });
}
// Function to update the SubforumPage UI with subforum title and posts
function updateSubforumPageUI(subforumData,subforumName) {
    console.log('Updating Subforum Page UI');
    console.log('Subforum Data:', subforumData);
    // display subforum title and posts
    const titleElement = $('.SubforumPage .Title h2');
    const postsContainer = $('.SubforumPage .Posts');

    // Update subforum title
    titleElement.html(subforumName);

    // Clear existing posts
    postsContainer.empty();

    // Loop through the posts and append them to the container
    subforumData.forEach(function (post) {
        const postHTML = `<div class="post">
                             <div class="post-content" data-post-id="' + ${post.PostID} + '">
                                 <h3>${post.Title}</h3>
                                 <p>${post.Content}</p>
                             </div>
                             <div class="post-actions">
                                 <button class="reply-button">Reply</button>
                                 <button class="delete-post-button">Delete</button>
                                 <div class="vote-section">
                                     <i class="fas fa-arrow-up"></i>
                                     <span class="vote-count">${post.UpVotes}</span>
                                     <i class="fas fa-arrow-down"></i>
                                 </div>
                             </div>
                         </div>`;
        postsContainer.append(postHTML);
    });
}
// Function to handle deleting a post



function fetchPosts(){
    $.ajax({
        url: http//:localhost:3000/
    });
}

       



///////////////////////////////////////////////////////////////////////////
//Post and Reply Section
function fetchRepliesForPost(postId, PostTitle) {
    $.ajax({
        url: `http://localhost:3000/campus-connect/replies/${postId}`,
        method: 'GET',
        success: function (data) {
            // Handle the retrieved replies data (replace this with your logic)
            console.log('Replies for Post ID:', postId, data);
            displayReplies(data, PostTitle); // Implement this function to display replies
        },
        error: function (error) {
            console.error('Failed to fetch replies for post:', error.responseJSON);
            // Handle errors or show a user-friendly message
        }
    });
}

function displayReplies(replies, PostTitle) {
    // display replies
    const repliesContainer = $('.Replies');
    const postTitle = $('.ReplyPagePostTitle').find('h2').text(PostTitle);

    // Clear existing replies
    repliesContainer.empty();

    // Loop through the replies and append them to the container
    replies.forEach(function (reply) {
        const replyHTML = `<div class="Reply">
                               <div class="ReplyContent">${reply.Content}</div>
                               <div class="ReplyInfo">${reply.UserID} - ${reply.ResponceDate}</div>
                               <button class="EditButton" data-responceid="${reply.ResponceID}">Edit</button>
                           </div>`;
        repliesContainer.append(replyHTML);
    });

    // Attach click event to edit buttons
    $('.EditButton').click(function () {
        const responceId = $(this).data('responceid');
        // Implement logic to handle editing for the corresponding reply
        editReply(responceId);
    });

    function editReply(responceId) {
    // Assuming you have a way to get the edited content (replace this with your logic)
    const editedContent = prompt('Enter edited content:');

    // Check if the user clicked "Cancel"
    if (editedContent === null) {
        return;
    }

    // Make an AJAX request to update the reply
    $.ajax({
        url: `http://localhost:port/posts/${postId}/responce/${responceId}`,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({ content: editedContent }),
        success: function (data) {
            // Handle the success response (replace this with your logic)
            console.log('Reply edited successfully:', data);
            // Refresh the replies after editing
            fetchRepliesForPost(postId);
        },
        error: function (error) {
            console.error('Failed to edit reply:', error.responseJSON);
            // Handle errors or show a user-friendly message
        }
    });
}

}
