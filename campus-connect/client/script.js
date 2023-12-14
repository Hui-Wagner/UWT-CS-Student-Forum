// Declare global variables for subforum ID and name
let globalSubforumID;
let globalSubforumName;
let globalPostID;
let globalPostTitle;
let globalPostDetails;

// Document ready function
$(document).ready(function () {
    // Hide elements on page load
    $(".test").hide();
    $('.SubforumPage').hide(); // Corrected the selector for SubforumPage
    $('.ReplyPage').hide();
    
    // Fetch home page forums data on page load
    fetchHomePageForumsData();
    
    // Check if user is logged in and show/hide elements accordingly
    if (isUserLoggedIn()) {
        $("#userDropdown").show();
        $(".login_button").hide();
        $(".logout_button").show();
        $(".signup_button").hide();
    }
    
    // Hide user dropdown if user is not logged in
    if (!isUserLoggedIn()) {
        $("#userDropdown").hide();
    }

    // Open selected subforum and display posts
    $(document).on('click', '.subforum', function () {
        $(".Main-Container").hide();
        const subforumID = $(this).data('subforum-id');
        const subforumName = $(this).find('h4').text();
        globalSubforumID = subforumID;
        globalSubforumName = subforumName;
        getSubforumDetailsAndPosts(subforumID, subforumName);
        $('.SubforumPage').show();
    });

   // Open the Post Page with the replies
   $(document).on('click', '.post', function () {
    $(".SubforumPage").hide();
    const PostID = $(this).find('.post-content').data('post-ids');
    const PostTitle = $(this).find('h3').text();
    const PostDetails = $(this).find('p').text();
    globalPostID = PostID;
    globalPostTitle = PostTitle;
    globalPostDetails = PostDetails;
    console.log("The post id from clicking on the post" + PostID);
    console.log(PostTitle);
    console.log(PostDetails);
    fetchRepliesForPost(PostID, PostTitle, PostDetails);
    $('.ReplyPage').show();
});


   // Event listener for upvote button
$('.Posts').on('click', '.fas.fa-arrow-up', function () {
    // Extract post ID from the data attribute of the post-content element
    const postID = $(this).closest('.post-content').data('post-id');

    // AJAX request to upvote the post
    $.ajax({
        url: `http://localhost:3000/posts/upvote/${postID}`,
        method: 'PATCH',
        success: function (data) {
            // Update the vote count in the UI
            const voteCountElement = $(this).siblings('.vote-section').find('.vote-count');
            voteCountElement.text(data.voteCount); // Update UI with the updated vote count
        },
        error: function (error) {
            console.error('Failed to upvote post:', error.responseJSON);
        }
    });
});

// Event listener for downvote button
$('.Posts').on('click', '.fas.fa-arrow-down', function () {
    // Extract post ID from the data attribute of the post-content element
    const postID = $(this).closest('.post-content').data('post-id');

    // AJAX request to downvote the post
    $.ajax({
        url: `http://localhost:3000/posts/downvote/${postID}`,
        method: 'PATCH',
        success: function (data) {
            // Update the vote count in the UI
            const voteCountElement = $(this).siblings('.vote-section').find('.vote-count');
            voteCountElement.text(data.voteCount); // Update UI with the updated vote count
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
    // Perform logout logic, e.g., clear localStorage
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
            // Store token in localStorage upon successful login
            localStorage.setItem('token', data.token);
            alert('Logged in successfully! Token stored in localStorage');

            // Hide/show appropriate elements after login
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

// Event listener for user button
$(".user-button").on('click', function () {
    toggleUserDropdown();
});

// Event listener for create post button
$('.SubforumPage .create-post-button').on('click', function () {
    // Implement logic to open a modal or navigate to the create post page
    console.log('Create Post button clicked');
});

// Event listener for delete buttons (delegated to dynamically created elements)
$(document).on('click', '.delete-post-button', function (event) {
    event.preventDefault();

    // Get the postID from the data attribute of the parent post-content element
    const postID = $(this).closest('.post').find('.post-content').data('post-ids');
    console.log("YOOOO this is the postid" + postID);

    // Call a function to handle post deletion based on the postID
    deletePost(postID);
});

// Event listener for search button
$('#searchButton').on('click', function () {
    var keyword = $('#searchInput').val();
    if (keyword) {
        searchPosts(keyword);
    } else {
        alert('Please enter a keyword to search.');
    }
});

// Event listener for create post button in SubforumPage
$('.SubforumPage .create-post-button').on('click', function () {
    // Open the create post modal
    $('#createPostModal').modal('show');
});

// Handle form submission for creating a new post
$('#createPostForm').on('submit', function (event) {
    event.preventDefault();

    const subforumID = globalSubforumID; // Assuming globalSubforumID is defined globally
    const title = $('#postTitle').val();
    const content = $('#postContent').val();

    // Make an AJAX request to create the post
    $.ajax({
        url: 'http://localhost:3000/campus-connect/posts',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        contentType: 'application/json',
        data: JSON.stringify({
            subforumid: subforumID,
            title: title,
            content: content
        }),
        success: function (data) {
            // Log success message
            console.log('Post created successfully:', data);

            // Close the modal after successful post creation
            $('#createPostModal').modal('hide');

            // Fetch the updated subforum data
            getSubforumDetailsAndPosts(subforumID, globalSubforumName);
        },
        error: function (error) {
            console.error('Failed to create post:', error.responseJSON);
        }
    });
});

// Event listener for submit button in reply page
$(document).on('click', '.SubmitButton', function () {
    
    const postId = 2;
    console.log("This is the post" + postId);

    // Get the content from the textarea
    const replyContent = $('.ReplyTextArea').val();
    console.log(replyContent);

    // Make the AJAX request to create a reply
    $.ajax({
        url: `http://localhost:3000/campus-connect/replies/${postId}`,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        contentType: 'application/json',
        data: JSON.stringify({
            content: replyContent
        }),
        success: function (data) {
            // Log success message or handle accordingly
            console.log('Reply created successfully:', data);

            // Reload the replies after creating a new one
            fetchRepliesForPost(postId);
        },
        error: function (error) {
            // Log or display an error message
            console.error('Failed to create reply:', error.responseJSON);
        }
    });
});

    



});
// Header Search Posts
function searchPosts(keyword) {
    $.ajax({
        url: `http://localhost:3000/search/${keyword}`, // Ensure this is the correct URL
        method: 'GET',
        success: function (posts) {
            // Assuming you have a function or method to display posts
            displaySearchResults(posts);
        },
        error: function (error) {
            console.error('Search failed:', error);
            alert('Failed to perform search. Please try again later.');
        }
    });
}

function displaySearchResults(posts) {
    // Clear existing posts
    $('.Posts').empty();

    // Append new search results
    posts.forEach(function(post) {
        var postHTML = `<div class="post">
                            <div class="post-content" data-post-id="${post.postid}">
                                <h3>${post.Title}</h3>
                                <p>${post.Content}</p>
                            </div>
                            <!-- Other post details and actions here -->
                        </div>`;
        $('.Posts').append(postHTML);
    });
}

// Header Logged In User DropDown
function toggleUserDropdown() {
    $("#userDropdownContent").slideToggle();
}

// Login Methods
// Check if User is Logged in
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

// Home Page Methods
function fetchHomePageForumsData() {
    var iconClasses = ['fa-solid fa-w', 'fa-solid fa-terminal', 'fa-solid fa-calculator', 'fa-solid fa-music', "fa-solid fa-flask", "fa-solid fa-book", "fa-solid fa-medical", "fa-solid fa-plane", "fa-solid fa-bowl-food", "fa-solid fa-film"];
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
                var newSubforum = $('<div class="subforum" data-subforum-id="' + forum.SubForumID + '"><i class="' + iconClass + '"></i><h4>' + forum.Name + '</h4></div>');
                // Append the new subforum to the subforums container
                $(".subforums").append(newSubforum);
            });
        },
        error: function () {
            // Handle error
            console.error('Failed to fetch forum data.');
        }
    });
}

// SubForum Page Methods
// Function to get subforum details and posts based on SubForumID
function getSubforumDetailsAndPosts(subforumID, subforumName) {
    $.ajax({
        url: `http://localhost:3000/forums/posts/${subforumID}`,
        method: 'GET',
        success: function (data) {
            // Update the UI with subforum title and posts
            console.log('Subforum Details and Posts:', data);
            updateSubforumPageUI(data, subforumName); // Implement this function to update UI
        },
        error: function (error) {
            console.error('Failed to fetch subforum details and posts:', error.responseJSON);
            // Handle errors or show a user-friendly message
        }
    });
}

// Function to update the SubforumPage UI with subforum title and posts
function updateSubforumPageUI(subforumData, subforumName) {
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
                            <div class="post-content" data-post-ids="${post.PostID}">
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
function deletePost(postID) {
    // Implement deletion logic as needed
    console.log('Deleting post with ID:', postID);

    // Get the token from localStorage
    const token = localStorage.getItem('token');

    // Make an AJAX request to delete the post
    $.ajax({
        url: `http://localhost:3000/campus-connect/posts/${postID}`,
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        success: function (data) {
            // Log the success message
            console.log('Post deleted successfully:', data);

            // After successful deletion, fetch the updated subforum data
            const subforumID = globalSubforumID; // Assuming globalSubforumID is defined globally
            const subforumName = globalSubforumName; // Assuming globalSubforumName is defined globally

            // Fetch subforum details and posts
            getSubforumDetailsAndPosts(subforumID, subforumName);
        },
        error: function (error) {
            console.error('Failed to delete post:', error.responseJSON);
        }
    });
}

function fetchPosts() {
    $.ajax({
        url: 'http://localhost:3000/'
    });
}

// Post and Reply Section
function fetchRepliesForPost(postId, PostTitle, PostDetails) {
    $.ajax({
        url: `http://localhost:3000/campus-connect/replies/${postId}`,
        method: 'GET',
        success: function (data) {
            // Handle the retrieved replies data
            console.log('Replies for Post ID:', postId, data);
            console.log(PostTitle);
            displayReplies(data, PostTitle, PostDetails); // Implement this function to display replies
        },
        error: function (error) {
            console.error('Failed to fetch replies for post:', error.responseJSON);
            // Handle errors or show a user-friendly message
        }
    });
}

function displayReplies(replies, PostTitle, PostDetails) {
    // display replies
    const repliesContainer = $('.Replies');
    const postTitle = $('.ReplyPagePostTitle').find('h2').text(PostTitle);
    const postDetails = $('.ReplyPagePostTitle').find('p').text(PostDetails);

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
            url: `http://localhost:3000/posts/${postId}/responce/${responceId}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ content: editedContent }),
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
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



